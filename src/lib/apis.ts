function rapidApiWordsApi(word: string, rapidApiKey: string) {
  return {
    method: `GET`,
    url: `https://wordsapiv1.p.rapidapi.com/words/${encodeURI(
      word
    )}/definitions`,
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": `wordsapiv1.p.rapidapi.com`,
    },
  };
}

export async function defineWord(word: string) {
  if (!process.env.RAPID_API_KEY) {
    return null;
  }

  const { url, headers } = rapidApiWordsApi(
    word,
    process.env.RAPID_API_KEY as string
  );

  const res = await fetch(url, {
    headers,
  });

  const obj = await res.json();

  if (!obj.definitions) {
    return null;
  }

  return {
    definition: obj.definitions?.[0].definition,
  };
}

const quoteExample = {
  _id: `Npg765fDCW9b`,
  content: `Through pride we are ever deceiving ourselves. But deep down below the surface of the average conscience a still, small voice says to us, something is out of tune.`,
  author: `Carl Jung`,
  tags: [`Famous Quotes`],
  authorSlug: `carl-jung`,
  length: 163,
  dateAdded: `2020-09-09`,
  dateModified: `2023-04-14`,
};

type Quote = typeof quoteExample;

export async function getRandomQuote() {
  const res = await fetch(`https://api.quotable.io/random`);
  const obj = (await res.json()) as Quote;

  return obj;
}
