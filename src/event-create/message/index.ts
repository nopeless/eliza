import hello from "./hello.js";
import translate from "./translate.js";
import saveFile from "./save-file.js";
import help from "./help.js";
import commands from "./commands/index.js";
import urlUnshortener from "./url-unshortener.js";
import define from "./define.js";
import suggestion from "./suggestion.js";
import randomQuote from "./random-quote.js";
import natural from "./natural.js";
import searchCult from "./search-cult.js";
import { Id, U2I } from "../../lib/util.js";

type ReduceToNeverProps<
  Arr extends readonly Record<string, unknown>[],
  Cum extends string = never
> = Arr extends readonly [
  infer Head,
  ...infer Rest extends readonly Record<string, unknown>[]
]
  ? [
      Head & Record<Cum & keyof Head, never>,
      ...ReduceToNeverProps<Rest, Cum | (keyof Head & string)>
    ]
  : Arr;

function merge<Arr extends readonly Record<string, unknown>[]>(
  ...objects: ReduceToNeverProps<Arr>
): Id<U2I<Arr[number]>> {
  const keyPool = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (keyPool.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      keyPool.add(key);
    }
  }

  return Object.assign({}, ...objects);
}

export default merge(
  // commands
  commands,
  {
    // strict passive communication modules
    hello,
    randomQuote,

    // commands
    translate,
    define,
    saveFile,
    suggestion,
    searchCult,

    // passive
    urlUnshortener,

    // fallback
    help,

    // natural language processing
    natural,
  }
);
