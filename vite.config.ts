import { createConfig } from "nopeless-config/vite-config";
import { mergeConfig } from "vite";
import "vitest/config";

export default mergeConfig(
  createConfig({
    experimentalViteAliasResolution: `./test/tsconfig.json`,
  }),
  {
    test: {
      setupFiles: [`./test/setup.ts`],
    },
  }
);
