import hello from "./hello";
import translate from "./translate";
import saveFile from "./save-file";
import help from "./help";
import exit from "./exit";
import urlUnshortener from "./url-unshortener";
import define from "./define";

export default {
  // administrative
  exit,

  // commands
  translate,
  define,
  saveFile,
  hello,

  // passive
  urlUnshortener,

  // fallback
  help,
};
