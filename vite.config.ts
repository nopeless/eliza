import { createConfig } from "nopeless-config/vite-config";

export default createConfig({
  experimentalViteAliasResolution: `./test/tsconfig.json`,
});
