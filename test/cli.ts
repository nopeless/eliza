import { consola } from "consola";
import { dedent, indentTrailing } from "@/lib/util";
import { client } from "./fixtures.js";

async function main(): Promise<false | void> {
  const input = await consola.prompt(`Enter a string`, {
    initial: `eliza `,
  });

  // XXX This is a trash way of detecting, but blame unjs people
  if (typeof input === `symbol`) {
    consola.info(`^C - exit`);
    return false;
  }

  if (typeof input !== `string`) {
    console.warn(input);
    return;
  }

  if (input.match(/^[.!]?(?:exit|!?q(?:uit)?)$/)) {
    consola.info(`Exiting...`);
    return false;
  }

  // actually run input
  const response = await client.send(input);

  if (response.mockReplies.length === 0) {
    if (response.mockReactions.length > 0) {
      consola.info(`Reactions: ${response.mockReactions[0]!}`);
    } else {
      consola.info(`No reply`);
    }
  } else {
    consola.info(indentTrailing(response.mockReplies[0]!));
  }
}

function intro() {
  consola.info(
    ` ---- ` +
      indentTrailing(dedent`
    Interactive eliza cli ----
    This simulates Discord chat without having to run the bot

    By default, all channels are active`)
  );
}

(async () => {
  intro();

  for (;;) {
    const r = await main();
    if (r === false) {
      break;
    }
  }

  await client.destroy();
  consola.log(`Gracefully exited`);
})().catch((e) => {
  console.error(e);
});
