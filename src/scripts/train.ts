import { train } from "../lib/doc";
import { indentTrailing } from "../lib/util";

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
