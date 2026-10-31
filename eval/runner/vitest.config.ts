// eval/ is outside the pnpm workspace: point bare "zod" at the contracts package's copy.
import { fileURLToPath } from "node:url";
export default {
  resolve: { alias: { zod: fileURLToPath(new URL("../../packages/contracts/node_modules/zod", import.meta.url)) } },
  test: { include: ["**/*.test.ts"] },
};
