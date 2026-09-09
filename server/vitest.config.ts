import { defineConfig } from "vitest/config";

/**
 * The server source uses NodeNext-style ".js" specifiers that point at ".ts"
 * files. This resolver lets Vitest load them without changing the source.
 */
const resolveTsFromJsSpecifier = {
  name: "resolve-ts-from-js-specifier",
  enforce: "pre" as const,
  async resolveId(source: string, importer: string | undefined) {
    if (!source.startsWith(".") || !source.endsWith(".js") || !importer) return null;
    const resolved = await this.resolve(source.replace(/\.js$/, ".ts"), importer, {
      skipSelf: true,
    });
    return resolved ?? null;
  },
};

export default defineConfig({
  plugins: [resolveTsFromJsSpecifier],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 300_000,
    fileParallelism: false,
  },
});
