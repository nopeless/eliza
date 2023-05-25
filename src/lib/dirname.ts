import path from "path";
import { fileURLToPath } from "url";

export default function dirname(meta: ImportMeta) {
  return fileURLToPath(path.dirname(meta.url));
}
