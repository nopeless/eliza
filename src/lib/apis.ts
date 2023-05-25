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
    definition: obj.definitions[0].definition,
  };
}
