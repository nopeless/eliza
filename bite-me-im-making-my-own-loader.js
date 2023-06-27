import { isBuiltin } from "module";
import { resolve as resolveExtensionless } from "extensionless";

/**
 * https://stackoverflow.com/a/68621282/10629176
 */
const resolveSpecifierJs = (specifier) => {
  return !isBuiltin(specifier) &&
    specifier.match(/\/spica-node\/cache\/[\d\w]+$/)
    ? `${specifier}.js`
    : specifier;
};

export const resolve = async (specifier, context, nextResolve) => {
  return resolveExtensionless(specifier, context, (s, c, n) =>
    nextResolve(resolveSpecifierJs(s), c, n)
  );
};
