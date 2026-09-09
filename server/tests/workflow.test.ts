import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedDatabase } from "../src/seed/seedDatabase.js";

let mongod: MongoMemoryServer;
let app: Express;

const api = () => request(app);

const ids = async (path: string): Promise<Array<{ id: string; confirmed: boolean }>> => {
  const res = await api().get(path);
  return res.body.data as Array<{ id: string; confirmed: boolean }>;
};

const confirmAll = async (path: string) => {
  for (const item of await ids(path)) {
    await api().patch(`${path}/${item.id}/confirm`).expect(200);
  }
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDatabase(mongod.getUri("primeform_hmi_test"));
  await seedDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
  await mongod.stop();
});

describe("health", () => {
  it("reports service and database state without seeded data assumptions", async () => {
    const res = await api().get("/api/health").expect(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: "ok", database: "connected" },
    });
  });
});

describe("A. initial state", () => {
  it("starts at MACHINE_CHECKS / READY with nothing confirmed", async () => {
    const operation = (await api().get("/api/operation").expect(200)).body.data;
    expect(operation.currentStage).toBe("MACHINE_CHECKS");
    expect(operation.state).toBe("READY");
    expect(operation.startedAt).toBeNull();
    expect(operation.stoppedAt).toBeNull();

    const progress = (await api().get("/api/progress").expect(200)).body.data;
    expect(progress.machineChecks).toEqual({ confirmed: 0, total: 6 });
    expect(progress.tools).toEqual({ confirmed: 0, total: 4 });
    expect(progress.workpieceChecks).toEqual({ confirmed: 0, total: 6 });
    expect(progress.startupComplete).toBe(false);
  });

  it("seeds the VMC-01 machine and BRK-204 job", async () => {
    const machine = (await api().get("/api/machine").expect(200)).body.data;
    expect(machine).toMatchObject({
      id: "VMC-01",
      type: "Vertical Machining Center",
      machineState: "POWERED_ON",
      controlState: "AVAILABLE",
    });

    const setup = (await api().get("/api/setup").expect(200)).body.data;
    expect(setup).toMatchObject({
      jobName: "BRK-204 Bracket Machining",
      quantity: 10,
      operation: "Face Milling + Drilling",
      material: "Aluminium 6061-T6",
      drawing: "BRK-204",
      drawingRevision: "Rev B",
      program: "BRK204_OP10.NC",
      programRevision: "Rev 03",
      workOffset: "G54",
    });
  });
});

describe("B. machine checks", () => {
  it("rejects advancing at 0/6", async () => {
    const res = await api().post("/api/workflow/advance").expect(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("STAGE_REQUIREMENTS_NOT_MET");
  });

  it("rejects starting the operation before startup is complete", async () => {
    const res = await api().post("/api/operation/start").expect(409);
    expect(res.body.error.code).toBe("WORKFLOW_NOT_READY");
  });

  it("confirms a single check and reports 1/6", async () => {
    const [first] = await ids("/api/machine-checks");
    const res = await api().patch(`/api/machine-checks/${first!.id}/confirm`).expect(200);
    expect(res.body.data.find((c: { id: string }) => c.id === first!.id).confirmed).toBe(true);

    const progress = (await api().get("/api/progress")).body.data;
    expect(progress.machineChecks).toEqual({ confirmed: 1, total: 6 });
  });

  it("advances to TOOLS at 6/6", async () => {
    await confirmAll("/api/machine-checks");
    const progress = (await api().get("/api/progress")).body.data;
    expect(progress.machineChecks).toEqual({ confirmed: 6, total: 6 });
    expect(progress.canAdvance).toBe(true);

    const res = await api().post("/api/workflow/advance").expect(200);
    expect(res.body.data.currentStage).toBe("TOOLS");
  });
});

describe("C. tool sequencing", () => {
  it("rejects T02 and T03 before their predecessors", async () => {
    const tools = await ids("/api/tools");
    for (const index of [1, 2]) {
      const res = await api().patch(`/api/tools/${tools[index]!.id}/confirm`).expect(409);
      expect(res.body.error.code).toBe("TOOL_SEQUENCE_VIOLATION");
    }
  });

  it("rejects advancing before all four tools are confirmed", async () => {
    const tools = await ids("/api/tools");
    await api().patch(`/api/tools/${tools[0]!.id}/confirm`).expect(200);
    const res = await api().post("/api/workflow/advance").expect(409);
    expect(res.body.error.code).toBe("STAGE_REQUIREMENTS_NOT_MET");
  });

  it("confirms T01 → T04 in order and advances to WORKPIECE", async () => {
    await confirmAll("/api/tools");
    const tools = await ids("/api/tools");
    expect(tools.every((tool) => tool.confirmed)).toBe(true);
    expect(tools).toHaveLength(4);

    const res = await api().post("/api/workflow/advance").expect(200);
    expect(res.body.data.currentStage).toBe("WORKPIECE");
  });
});

describe("D. workpiece setup", () => {
  it("rejects advancing before 6/6", async () => {
    const res = await api().post("/api/workflow/advance").expect(409);
    expect(res.body.error.code).toBe("STAGE_REQUIREMENTS_NOT_MET");
  });

  it("advances to READY_REVIEW once every item is confirmed", async () => {
    await confirmAll("/api/workpiece-checks");
    const progress = (await api().get("/api/progress")).body.data;
    expect(progress.workpieceChecks).toEqual({ confirmed: 6, total: 6 });

    const res = await api().post("/api/workflow/advance").expect(200);
    expect(res.body.data.currentStage).toBe("READY_REVIEW");
  });
});

describe("E. ready review", () => {
  it("reports full startup readiness", async () => {
    const progress = (await api().get("/api/progress")).body.data;
    expect(progress.machineChecksComplete).toBe(true);
    expect(progress.toolsComplete).toBe(true);
    expect(progress.workpieceComplete).toBe(true);
    expect(progress.startupComplete).toBe(true);
  });

  it("advances to OPERATION", async () => {
    const res = await api().post("/api/workflow/advance").expect(200);
    expect(res.body.data.currentStage).toBe("OPERATION");
    expect(res.body.data.state).toBe("READY");
  });

  it("rejects advancing past the final stage", async () => {
    const res = await api().post("/api/workflow/advance").expect(409);
    expect(res.body.error.code).toBe("ALREADY_AT_FINAL_STAGE");
  });
});

describe("F. operation state machine", () => {
  it("starts READY → RUNNING", async () => {
    const res = await api().post("/api/operation/start").expect(200);
    expect(res.body.data.state).toBe("RUNNING");
    expect(res.body.data.startedAt).toBeTruthy();
  });

  it("rejects a second start", async () => {
    const res = await api().post("/api/operation/start").expect(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("stops RUNNING → STOPPED", async () => {
    const res = await api().post("/api/operation/stop").expect(200);
    expect(res.body.data.state).toBe("STOPPED");
    expect(res.body.data.stoppedAt).toBeTruthy();
  });

  it("rejects a second stop", async () => {
    const res = await api().post("/api/operation/stop").expect(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");
  });

  it("rejects restarting after STOPPED", async () => {
    const res = await api().post("/api/operation/start").expect(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");
  });
});

describe("G. persistence", () => {
  it("keeps confirmations, stage and timestamps on re-fetch", async () => {
    expect((await ids("/api/machine-checks")).every((c) => c.confirmed)).toBe(true);
    expect((await ids("/api/tools")).every((t) => t.confirmed)).toBe(true);
    expect((await ids("/api/workpiece-checks")).every((c) => c.confirmed)).toBe(true);

    const operation = (await api().get("/api/operation")).body.data;
    expect(operation.currentStage).toBe("OPERATION");
    expect(operation.state).toBe("STOPPED");
    expect(operation.startedAt).toBeTruthy();
    expect(operation.stoppedAt).toBeTruthy();
  });
});

describe("error handling", () => {
  it("returns 400 INVALID_ID for a malformed identifier", async () => {
    const res = await api().patch("/api/machine-checks/not-an-id/confirm").expect(400);
    expect(res.body.error.code).toBe("INVALID_ID");
  });

  it("returns 404 NOT_FOUND for an unknown endpoint", async () => {
    const res = await api().get("/api/does-not-exist").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for a well-formed but unknown resource id", async () => {
    const res = await api().patch("/api/tools/6a9ee50b41e48f0e43a3fa99/confirm");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("H. reset", () => {
  it("restores the seeded starting state", async () => {
    const res = await api().post("/api/reset").expect(200);
    expect(res.body.data).toMatchObject({
      currentStage: "MACHINE_CHECKS",
      state: "READY",
      startedAt: null,
      stoppedAt: null,
    });

    expect((await ids("/api/machine-checks")).every((c) => !c.confirmed)).toBe(true);
    expect((await ids("/api/tools")).every((t) => !t.confirmed)).toBe(true);
    expect((await ids("/api/workpiece-checks")).every((c) => !c.confirmed)).toBe(true);

    const progress = (await api().get("/api/progress")).body.data;
    expect(progress.machineChecks).toEqual({ confirmed: 0, total: 6 });
    expect(progress.tools).toEqual({ confirmed: 0, total: 4 });
    expect(progress.workpieceChecks).toEqual({ confirmed: 0, total: 6 });
  });
});

describe("health when the database is unavailable", () => {
  // Runs last: it intentionally drops the database connection.
  it("returns 503 with the standard error envelope", async () => {
    await disconnectDatabase();
    const res = await api().get("/api/health").expect(503);
    expect(res.body).toEqual({
      success: false,
      data: { status: "degraded", database: "disconnected" },
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The HMI service cannot reach its database.",
      },
    });
  });
});
