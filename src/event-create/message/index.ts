import hello from "./hello";
import translate from "./translate";
import saveFile from "./save-file";
import help from "./help";
import exit from "./exit";
import urlUnshortener from "./url-unshortener";
import define from "./define";
import suggestion from "./suggestion";
import randomQuote from "./random-quote";

export default {
  // administrative
  exit,

  // strict passive communication modules
  hello,
  randomQuote,

  // commands
  translate,
  define,
  saveFile,
  suggestion,

  // passive
  urlUnshortener,

  // fallback
  help,
};
