import hello from "./hello";
import translate from "./translate";
import saveFile from "./save-file";
import help from "./help";
import commands from "./commands";
import urlUnshortener from "./url-unshortener";
import define from "./define";
import suggestion from "./suggestion";
import randomQuote from "./random-quote";
import natural from "./natural";
import searchCult from "./search-cult";
import { Id, U2I } from "../../lib/util";

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
