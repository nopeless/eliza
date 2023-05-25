import natural from "natural";

export const wordnet = new natural.WordNet();
export const tokenizer = new natural.WordTokenizer();

/**
 * An extremely inefficient algorithm to check for string similarity
 *
 * @param a word to find
 * @param b sentence to search
 */
export function existsSynonym(a: string, b: string) {
  // tokenize b
  // check if any of the tokens are synonyms of a

  const tokens = tokenizer.tokenize(b);

  if (!tokens) return false;

  const syns = Object.create(null);

  wordnet.lookup(a, function (results) {
    results.forEach(function (result) {
      for (const syn of result.synonyms) {
        syns[syn] = true;
      }
    });
  });

  for (const token of tokens) {
    if (syns[token]) {
      return true;
    }
  }

  return false;
}
