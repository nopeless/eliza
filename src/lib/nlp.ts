/**
 * [apple] -> apple
 * [apple, banana] -> apple and banana
 * [apple, banana, orange] -> apple, banana, and orange
 */
export function toWordList(text: string[], mode: "or" | "and") {
  if (text.length === 1) {
    return text[0];
  }

  if (text.length === 2) {
    return text.join(` ${mode} `);
  }

  return `${text.slice(0, -1).join(`, `)}, ${mode} ${text.slice(-1)}`;
}

export const nonWords = Object.fromEntries(
  [
    `a`,
    `an`,
    `the`,
    `what`,
    `is`,
    `are`,
    `am`,
    `i`,
    `im`,
    `you`,
    `he`,
    `she`,
    `it`,
    `its`,
    `we`,
    `they`,
    `me`,
    `him`,
    `her`,
    `us`,
    `them`,
    `my`,
    `your`,
    `his`,
    `her`,
    `our`,
    `their`,
    `mine`,
    `yours`,
    `his`,
    `hers`,
    `ours`,
    `theirs`,
    `this`,
    `that`,
    `these`,
    `those`,
    `here`,
    `there`,
    `who`,
    `whom`,
    `whose`,
    `which`,
    `what`,
    `whatever`,
    `whoever`,
    `whomever`,
    `whichever`,
    `when`,
    `where`,
    `why`,
    `how`,
    `however`,
    `whenever`,
    `wherever`,
    `however`,
    `no`,
    `not`,
    `none`,
    `nobody`,
    `nothing`,
    `nowhere`,
    `never`,
    `neither`,
    `nor`,
    `none`,
    `nobody`,
    `nothing`,
    `nowhere`,
    `in`,
    `of`,
    `to`,
    `mr`,
    `ms`,
  ].map((word) => [word, true])
);
