import { train } from "../lib/doc.js";
import { indentTrailing } from "../lib/util.js";

const docs = await train();

// pretty print docs

for (const doc of docs) {
  console.log(`[${doc.slug}]`);
  console.log(
    indentTrailing(doc.questions.join(`\n`), `  `, { indentFirstLine: true })
  );
  console.log(
    indentTrailing(doc.answers.join(`\n`), `  > `, { indentFirstLine: true })
  );
}
