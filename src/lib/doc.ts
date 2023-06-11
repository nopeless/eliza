// @ts-ignore
import { NlpManager } from "node-nlp";
import { readFile, unlink } from "fs/promises";
import dirname from "./dirname";
import { join } from "path";
import assert from "assert";
import { existsSync } from "fs";
import { er } from "./regex-expander";

export const manager = new NlpManager({
  languages: [`en`],
  nlu: { useNoneFeature: false, log: false },
});

let nlpLoadPromise: undefined | ((...args: never[]) => void);

const loaded = new Promise<void>((r) => {
  nlpLoadPromise = r;
});

const loading = false;

export async function load() {
  if (loading) return loaded;

  if (!existsSync(`./model.nlp`)) {
    await train();
  } else {
    await manager.load();
  }
  nlpLoadPromise!();
}

const _responseShape = {
  utterance: `I should go now`,
  locale: `en`,
  languageGuessed: false,
  localeIso2: `en`,
  language: `English`,
  domain: `default`,
  classifications: [
    { intent: `greetings.bye`, score: 0.698219120207268 },
    { intent: `None`, score: 0.30178087979273216 },
    { intent: `greetings.hello`, score: 0 },
  ],
  intent: `greetings.bye`,
  score: 0.698219120207268,
  entities: [
    {
      start: 12,
      end: 14,
      len: 3,
      accuracy: 0.95,
      sourceText: `now`,
      utteranceText: `now`,
      entity: `datetime`,
      resolution: [Object],
    },
  ],
  sentiment: {
    score: 1,
    comparative: 0.25,
    vote: `positive`,
    numWords: 4,
    numHits: 2,
    type: `senticon`,
    language: `en`,
  },
  actions: [],
  srcAnswer: `Till next time`,
  answer: `Till next time`,
};

export async function doc(s: string) {
  await load();

  const r: typeof _responseShape = await manager.process(`en`, s);
  return {
    document: r,
    answer:
      r.classifications[0] && r.classifications[0].score > 0.5
        ? er(r.answer)
        : null,
  };
}

// TRAINING PART

/**
 * Loads file and trains
 */
export async function train() {
  if (existsSync(`./model.nlp`)) await unlink(`./model.nlp`);

  const docfile = await readFile(
    join(dirname(import.meta), `./document-responses.md`),
    {
      encoding: `utf8`,
    }
  );

  const parts = docfile.split(/-{3,}/);

  const docs = [];

  for (const part of parts) {
    const lines = part
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s !== ``);

    // do some validations
    if (lines.length < 2) {
      throw new Error(
        `Invalid document response file. Each part must have at least 2 lines. content: ${lines}`
      );
    }

    // do not ask me how this works
    const reconstructedPart = lines.join(`\n`);

    const matches = reconstructedPart.matchAll(
      /(.+?(?:\n(?!>).+?)*)((?:\n+>.+)+)/g
    );

    for (const match of matches) {
      const [_, question, answer] = match;

      assert(question);
      assert(answer);

      const questions = question
        .split(/\n/)
        .map((s) => s.trim())
        .filter((s) => s !== ``);
      const answers = answer
        .split(/\n/)
        .map((s) => s.slice(1).trim())
        .filter((s) => s !== ``);

      const first = questions[0];

      assert(first);

      // slugify
      const slug = first.replace(/\W+/g, `-`).toLowerCase();

      docs.push({
        slug,
        questions,
        answers,
      });

      for (const q of questions) {
        manager.addDocument(`en`, q, slug);
      }

      for (const a of answers) {
        manager.addAnswer(`en`, slug, a);
      }
    }
  }

  await manager.train();

  return docs;
}
