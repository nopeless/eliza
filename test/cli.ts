import { consola } from "consola";
import { isCancel } from "@clack/core"

async function main(): Promise<false |void> {
  const input = await consola.prompt("Enter a string"); 

  if (isCancel(input)) {
    consola.info("^C - exit");
    return false;
  }

  if (typeof input !== 'string') {
    console.warn(input);
    return;
  }

  if (input.match(/^[.!]?(?:exit|!?q(?:uit)?)$/)) {
    consola.info("Exiting...");
    return false;
  }
}

function intro() {
  consola.info(`
    Interactive eliza cli
    This simulates Discord chat without having to run the bot

    By default, all channels are active
  `)
}

(async () => {
  intro();

  while (true) {
    const r = await main();
    if (r === false) {
      break
    }
  }  
})().catch(e => {
   console.error(e);
});
