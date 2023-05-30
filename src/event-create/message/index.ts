import hello from "./hello";
import translate from "./translate";
import saveFile from "./save-file";
import help from "./help";
import exit from "./exit";
import urlUnshortener from "./url-unshortener";
import define from "./define";
import suggestion from "./suggestion";

export default {
  // administrative
  exit,

  // strict passive communication modules
  hello,

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
