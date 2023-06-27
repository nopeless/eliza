import { awaitTick, escapeRegExp } from "./util";
import { nonWords } from "./nlp";

// const alphanumericSplitterRegex = /(?<=[A-Za-z])\d+|^\d+/g;
const segmentRegex = /[A-Z]{2,}(?![a-z])|[A-Z][a-z]*|^[a-z]+|\d+/g;

// higher => get all the niche cults
// lower => only get really well defined cults
const CULT_SEGMENTATION_POPULARITY_THRESHOLD = 5;

export type CultUser = {
  id: string;
  name: string;
  numeralDiscriminator: null | string;
};

/**
 * Generate all possible segments from a string
 *
 * e.g. ["Hello", "World", "Its", "Me"]
 *
 * ["HelloWorldItsMe", "HelloWorldIts", "WorldItsMe", "HelloWorld", "WorldIts", "ItsMe", "Hello", "World", "Its", "Me"]
 */
function possibleSegmentGenerator(
  parts: string[],
  minmax: [number, number] = [0, Infinity]
) {
  const segments = [];

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j <= parts.length; j++) {
      if (j - i > minmax[1] || j - i < minmax[0]) {
        continue;
      }
      segments.push(parts.slice(i, j).join(``));
    }
  }

  return segments;
}

// function pascalCaseSegmenter(name: string) {
//   return [...name.matchAll(segmentRegex)]
//     .map((v) => v[0].normalize().toLowerCase())
//     .filter((word) => word && word.length > 1 && !nonWords[word])
//     .map((word) => capitalize(word));
// }

// function snakeCaseSegmenter(name: string) {
//   return name.split(`_`).flatMap((v) => {
//     if (v.length === 0) return [];
//     const l = pascalCaseSegmenter(v);
//     if (l.length === 0) return [capitalize(v)];
//     return l;
//   });
// }

export function segmenter(name: string) {
  const parts = name
    .split(/\s|\W|_/)
    .filter((v) => !!v)
    .flatMap((v) => v.match(segmentRegex) || [v])
    .map((v) => v.normalize().toLowerCase())
    .filter((v) => !Object.hasOwn(nonWords, v))
    .map(capitalize);
  return parts;
}

/**
 * Please pass in normalized strings
 */
function capitalize(s: string) {
  return s[0]!.toUpperCase() + s.slice(1).toLowerCase();
}

function identifyAdditionalSegments(name: string) {
  // identify capital parts
  const capitalParts = [...name.matchAll(/[A-Z]{3,}(?:\b|(?=\W)|(?=_))/g)];
  if (capitalParts.length === 1) {
    // FIA, this is for you
    return [capitalize(capitalParts[0]![0]!)];
  }
  let m;
  if ((m = name.match(/[^\w\s]{3,}/))) {
    // if using special characters, more than 1/3 should be unique
    const icon = m[0]!;
    if (
      // shouldn't be too long
      icon.length <= 6 &&
      // should be unique
      new Set(icon).size / icon.length > 1 / 3
    )
      return [icon];
  }
  return null;
}

type CalculateCultOptions = {
  skipCultPopulationValidation?: boolean;
};

export async function calculateSegments(users: CultUser[]) {
  // step 1. extract identifiers
  // this is done by identifying as much identifiers as possible
  // does not care about numbers

  /**
   * `<segment, count>`
   */
  const possibleSegments = new Map<string, number>();

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!;
    const name = user.name;
    const parts = segmenter(name);

    const segments = possibleSegmentGenerator(parts, [2, 4]);

    // segments.push(...parts);

    const additionalSegments = identifyAdditionalSegments(name);

    if (additionalSegments) {
      segments.push(...additionalSegments);
    }

    const scache = Object.create(null);

    for (const segment of segments) {
      // a user cannot submit two identical segments
      if (scache[segment]) continue;
      scache[segment] = true;
      // lowercase identifiers
      if (segment.length <= 1) continue;

      if (!possibleSegments.has(segment)) {
        possibleSegments.set(segment, 1);
      } else {
        // increase by one
        possibleSegments.set(segment, possibleSegments.get(segment)! + 1);
      }
    }

    if (i % 100 !== 0) await awaitTick;
  }

  // step 2. get segments with at least 2 in popularity
  for (const [segment, count] of possibleSegments) {
    // need at least 2 for a cult
    // segment must be at least 3 letters long
    if (count < 2 || segment.length < 3 || segment.match(/(.)\1\1/)) {
      possibleSegments.delete(segment);
    }
  }

  return possibleSegments;
}

/**
 * ALTERS `possibleSegments` IN PLACE, PLEASE PASS IN NEW MAP
 */
export async function calculateCults(
  possibleSegments: Map<string, number>,
  users: CultUser[],
  options: CalculateCultOptions = {}
) {
  // step 3. attempt to associate users with their cults
  const indoctrinatedUsers = new Set<string>();

  const { skipCultPopulationValidation = false } = options;

  const cults = [];

  const normalizeCache = new Map<string, string>();
  const combineCache = new Map<string, string>();
  for (const user of users) {
    normalizeCache.set(user.name, user.name.normalize().toLowerCase());
    combineCache.set(user.name, user.name.replace(/\W/g, ``));
  }

  // console.time(`cult`);
  let i = 0;

  for (const prominentCult of [...possibleSegments.entries()].sort(
    ([segment, count]) =>
      (segment.match(/[a-z]/i) ? 1000 : 0) + 100 * segment.length + count
  )) {
    const cultName = prominentCult[0]!;
    possibleSegments.delete(cultName);

    // console.timeLog(`cult`, cultName, prominentCult[1]);
    if (
      prominentCult[1]! <= CULT_SEGMENTATION_POPULARITY_THRESHOLD &&
      !skipCultPopulationValidation
    )
      continue;
    i++;

    // Yes, i know this is redundant, but believe it or not generating it here doesn't matter that much
    const segments = [...cultName.matchAll(segmentRegex)].map(
      (v) => v[0]
      // cult names arrive normalized already
      // .normalize().toLowerCase()
    );

    const seg = segments.map((v) => v.toLowerCase()).join(` `);
    const cultRegexB = new RegExp(`\\b${escapeRegExp(seg)}\\b`, `i`);

    const normalizedCultName = cultName.normalize().toLowerCase();

    // USA
    const isLiteralLiteral = !!cultName.match(/^[A-Z]+$/);

    let devoutAssociates = 0;

    // find associates
    const associates = users.filter((u) => {
      if (indoctrinatedUsers.has(u.id)) return false;

      if (isLiteralLiteral) {
        if (u.name === cultName) {
          devoutAssociates++;
          return true;
        }

        if (
          u.name.match(/\s/) &&
          // no need to escape regex as it is literal
          u.name.match(cultRegexB)
        ) {
          devoutAssociates++;
          return true;
        }

        return false;
      }

      if (normalizeCache.get(u.name)!.includes(normalizedCultName)) {
        // segmentation stragey
        if (
          normalizeCache.get(u.name)!.split(/\W/).includes(normalizedCultName)
        ) {
          devoutAssociates++;
          return true;
        }

        // contains both capital and lowercase letters. They must have the cult name properly
        if (u.name.match(/[A-Z]/) && u.name.match(/[a-z]/)) {
          // devout believer
          if (u.name.includes(cultName)) {
            devoutAssociates++;
            return true;
          }

          const arrname = [...u.name.matchAll(segmentRegex)]
            .map((v) => v[0].normalize().toLowerCase())
            .join(` `);
          const isMatch = !!arrname.match(cultRegexB);
          if (isMatch) devoutAssociates++;
          return isMatch;
        }

        // this is a little tricky
        if (
          u.name.match(/\s/) &&
          u.name.match(new RegExp(`\\b${cultName}\\b`))
        ) {
          // just assume that it isn't one of those ihatelife32 people
          // makes my life a little easier
          return true;
        }
        return true;
      }

      // you have no hope, fowl believer
      return false;
    });

    if (
      (associates.length < 5 || devoutAssociates * 2 < associates.length) &&
      !(skipCultPopulationValidation && associates.length > 0)
    ) {
      continue;
    }

    // registering cult
    cults.push({
      identifier: normalizedCultName,
      name: cultName,
      associates: associates,
    });

    for (const associate of associates) {
      indoctrinatedUsers.add(associate.id);
    }

    if (i % 10 !== 0) await awaitTick;
  }

  // console.timeEnd(`cult`);

  return cults;
}

/**
 * Returns JSON serializable object
 */
export function cultCacheExport(segments: Map<string, number>) {
  return Object.fromEntries(segments.entries());
}

/**
 * Returns Map<string, 0> to pass into identifyCults
 */
export function cultCacheImport(segments: Record<string, number>) {
  return new Map(Object.entries(segments));
}
