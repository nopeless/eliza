import { awaitTick, escapeRegExp, max } from "./util";
import { nonWords } from "./nlp";

// const alphanumericSplitterRegex = /(?<=[A-Za-z])\d+|^\d+/g;
const segmentRegex = /[A-Z]{2,}(?![a-z])|[A-Z][a-z]*/g;

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

// function extractParts(name: string) {
//   // space has highest priority
//   return name
//     .split(/\s+|_+|-+/)
//     .flatMap(
//       // segmentation
//       (s) => s.split(alphanumericSplitterRegex)
//     )
//     .flatMap((s) => {
//       const matches = [...s.matchAll(segmentRegex)];

//       if (matches.length === 0) matches.push([s]);

//       return matches;
//     })
//     .map((s) => s[0].normalize().toLowerCase());
// }

function capitalize(s: string) {
  return s[0]!.toUpperCase() + s.slice(1).toLowerCase();
}

function identifyAdditionalSegments(name: string) {
  // additional segments
  if (name.match(/[A-Z]/) && name.match(/[a-z]/)) {
    // identify capital parts
    const capitalParts = [...name.matchAll(/\b[A-Z]{3,}\b/g)];
    if (capitalParts.length === 1) {
      // FIA, this is for you
      return [capitalParts[0]![0]!];
    }
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

/**
 * Adds new property to users, be careful
 */
export async function identifyCults(users: { id: string; name: string }[]) {
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
    const parts = [...name.matchAll(segmentRegex)]
      .map((v) => v[0].normalize().toLowerCase())
      .filter((word) => word && word.length > 1 && !nonWords[word])
      .map((word) => capitalize(word));

    if (parts.length === 0) parts.push(name);

    const segments = possibleSegmentGenerator(parts, [2, 4]);

    const additionalSegments = identifyAdditionalSegments(name);

    if (additionalSegments) {
      segments.push(...additionalSegments);
    }

    const scache = Object.create(null);

    for (const segment of segments) {
      if (scache[segment]) continue;
      scache[segment] = true;
      // lowercase identifiers
      if (segment.length <= 1) continue;

      if (!possibleSegments.has(segment)) {
        possibleSegments.set(segment, 0);
      }

      // increase by one
      possibleSegments.set(segment, possibleSegments.get(segment)! + 1);
    }

    if (i % 100 !== 0) await awaitTick;
  }

  // console.log(possibleSegments);

  // step 2. get segments with at least 2 in popularity
  for (const [segment, count] of possibleSegments) {
    // need at least 2 for a cult
    // segment must be at least 3 letters long
    if (count < 2 || segment.length < 3 || segment.match(/(.)\1\1/)) {
      possibleSegments.delete(segment);
    }
  }

  // step 3. attempt to associate users with their cults
  const indoctrinatedUsers = new Set<string>();

  const cults = [];

  const normalizeCache = Object.create(null) as Record<string, string>;
  const combineCache = Object.create(null) as Record<string, string>;
  for (const user of users) {
    normalizeCache[user.name] = user.name.normalize().toLowerCase();
    combineCache[user.name] = user.name.replace(/\W/g, ``);
  }

  // console.log([...possibleSegments.keys()].filter((x) => x.length === 3));

  while (possibleSegments.size > 0) {
    const prominentCult = max(
      possibleSegments,
      ([segment, count]) =>
        (segment.match(/[a-z]/i) ? 1000 : 0) + 100 * segment.length + count
    )!;
    const cultName = prominentCult[0]!;
    possibleSegments.delete(cultName);

    // console.log(cultName);

    // Yes, i know this is redundant, but believe it or not generating it here doesn't matter that much
    const segments = [...cultName.matchAll(segmentRegex)].map(
      (v) => v[0]
      // cult names arrive normalized already
      // .normalize().toLowerCase()
    );

    const seg = segments.map((v) => v.toLowerCase()).join(` `);
    const cultRegexB = new RegExp(`\\b${escapeRegExp(seg)}\\b`);

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
          u.name.match(new RegExp(`\\b${cultName}\\b`))
        ) {
          devoutAssociates++;
          return true;
        }

        return false;
      }

      if (normalizeCache[u.name]!.includes(normalizedCultName)) {
        // segmentation stragey
        if (normalizeCache[u.name]!.split(/\W/).includes(normalizedCultName)) {
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

      return false;
      // // you have no hope, fowl believer
      // if (!segments.some((s) => normalizeCache[u.name]!.includes(s[0]))) return;

      // // lets see if we can find a match
      // const bestMatch = bestStringMatch(u.name, cultName);

      // if (bestMatch === null) return;

      // // eh, you will do
      // if (bestMatch.length - cultName.length <= 5) return true;

      // return false;
    });

    console.log(cultName, associates);

    if (associates.length < 5 || devoutAssociates * 2 < associates.length) {
      continue;
    }

    // const exactFrequent = new Map<string, number>();

    // for (const exact of exacts) {
    //   if (exact === null) continue;

    //   if (!exactFrequent.has(exact)) {
    //     exactFrequent.set(exact, 0);
    //   }

    //   exactFrequent.set(exact, exactFrequent.get(exact)! + 1);
    // }

    // const cultRepresentative = max(exactFrequent, ([_, count]) => count)!;

    // if (cultRepresentative[1]! <= 1) {
    //   // cult is rather, indecisive
    //   possibleSegments.delete(prominentCult[0]!);
    //   continue;
    // }

    // registering cult
    cults.push({
      identifier: normalizedCultName,
      name: cultName,
      associates: associates,
    });

    // removing associates from possibleSegments
    for (const associate of associates) {
      indoctrinatedUsers.add(associate.id);

      // const associateCultAssociations = userSegmentAssociations.get(
      //   associate.id
      // );
      // if (!associateCultAssociations) continue;

      // for (const ca of associateCultAssociations) {
      //   const segment = possibleSegments.get(ca);
      //   if (!segment) continue;

      //   segment.count--;
      // }
    }

    // possibleSegments.delete(prominentCult[0]!);

    // // cleaning
    // for (const [segment, segmentInfo] of possibleSegments) {
    //   if (segmentInfo.count < 3) {
    //     possibleSegments.delete(segment);
    //   }
    // }

    await awaitTick;
  }

  return cults;
}
