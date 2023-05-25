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
