import natural, { DamerauLevenshteinDistanceOptions } from "natural";

const LevenshteinDistance = natural.LevenshteinDistance;

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sortByKey<T>(arr: T[], key: (o: T) => number) {
  // create cache
  const cache: Map<T, number> = new Map(arr.map((item) => [item, key(item)]));

  // sort
  return arr.sort((a, b) => cache.get(a)! - cache.get(b)!);
}

export function sortBySimilarity(
  key: string,
  strings: string[],
  optionsOverride: DamerauLevenshteinDistanceOptions = {}
) {
  const options = {
    insertion_cost: 0.5,
    deletion_cost: 1,
    substitution_cost: 1,
    ...optionsOverride,
  };

  return sortByKey(strings, (k) =>
    k.includes(key)
      ? (k.length - key.length) / k.length
      : LevenshteinDistance(key, k, options) * 1
  );
}

export function reverse(s: string) {
  return s.split(``).reverse().join(``);
}

export function capitalize(s: string) {
  if (s.length === 0) return ``;
  return s[0]!.toUpperCase() + s.slice(1);
}

export async function promiseAllMap<
  T,
  F extends (arg: T, index: number) => unknown
>(arr: T[], fn: F): Promise<Awaited<ReturnType<F>>[]> {
  const promises = arr.map(fn) as ReturnType<F>[];
  const results = await Promise.all(promises);
  return results;
}

export const fakeTime = {
  readText: async function (text: string, speed = 100) {
    await sleep((text.length * 1000 * 0.2 * 60) / speed);
  },
  thinkText: async function (text: string, multiplier = 1) {
    // for now im going to assume that it takes 0.2 seconds to think 1 word
    await sleep(text.split(` `).length * 0.2 * 1000 * multiplier);
  },
  writeText: async function (text: string, wpm = 60) {
    // for now im going to assume that all characters take the same amount of time to type
    await sleep((text.length * 1000 * 0.2 * 60) / wpm);
  },
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates

const identity = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);

/**
 * Returns 0 if no lines with content were found
 */
function _indentLength(lines: string[]) {
  // filter
  lines = lines.filter((line) => line !== ``);

  if (lines.length === 0) return 0;

  // get minimum length of all strings
  const minLength = lines.reduce((min, line) => {
    return Math.min(min, line.length);
  }, Infinity);

  let i = 0;
  for (i; i < minLength; i++) {
    const space = lines[0]![i]!;
    // space is single char, ^$ not needed
    if (!/\s/.test(space)) return i;

    for (const line of lines) {
      if (line[i] !== space) {
        return i;
      }
    }
  }

  return i;
}

export function randomChoice<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function dedent(arg: string): string;
export function dedent(arg: TemplateStringsArray, ...vars: unknown[]): string;
/**
 * While it accepts \r and \n, the final string is always \n
 *
 * leading newlines are always removed
 *
 * trailing lines are removed if they are all whitespace
 */
export function dedent(
  ...args: [string] | [TemplateStringsArray, ...unknown[]]
): string {
  if (typeof args[0] === `string`) {
    // normalize args
    args = [args[0]];
  }

  const [templateStrings, ...vars] = args as [
    TemplateStringsArray,
    ...unknown[]
  ];

  const res = identity(templateStrings, ...vars);

  let lines = res.split(/(?:\n\r?|\r\n?)/);

  if (lines.length === 0) return ``;

  const start = lines[0] === `` ? 1 : 0;
  const end = /^\s+$/.test(lines[lines.length - 1]!)
    ? lines.length - 1
    : lines.length;

  lines = lines.slice(start, end);

  const il = _indentLength(lines);

  lines = lines.map((line) => line.slice(il));

  return lines.join(`\n`);
}

/**
 * Returns a regex that is swappable
 *
 * adds `i` flag by default
 */
export function swappableRegex(
  regex1: RegExp,
  regex2: RegExp,
  options: { flags?: string } = {}
) {
  return new RegExp(
    `^(?:(?:${regex1.source})\\s+(?:${regex2.source})|(?:${regex2.source})\\s+(?:${regex1.source}))`,
    options.flags ?? `i`
  );
}

/**
 * inserts `\s+` between as well
 */
export function mergeRegex(regex1: RegExp, regex2: RegExp) {
  return new RegExp(`(?:${regex1.source})\\s+(?:${regex2.source})`, `i`);
}

export function indentTrailing(
  text: string,
  indent = `  `,
  options: { indentFirstLine?: boolean } = {}
) {
  const lines = text.split(/\n/);

  const firstLine = options.indentFirstLine ? 0 : 1;

  return lines
    .map((line, i) => {
      if (i < firstLine) return line;
      return indent + line;
    })
    .join(`\n`);
}
