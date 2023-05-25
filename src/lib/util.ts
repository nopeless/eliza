export function sortByKey<T>(arr: T[], key: (o: T) => number) {
  // create cache
  const cache: Map<T, number> = new Map();

  for (const item of arr) {
    cache.set(item, key(item));
  }

  // sort
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return arr.sort((a, b) => cache.get(a)! - cache.get(b)!);
}

export function reverse(s: string) {
  return s.split(``).reverse().join(``);
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
