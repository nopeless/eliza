import { isBuiltin } from "module";
import { resolve as resolveExtensionless } from "extensionless";

/**
 * https://stackoverflow.com/a/68621282/10629176
 */
const resolveSpecifierJs = (specifier) => {
  if (isBuiltin(specifier)) return specifier;

  const [_, pkgName, moduleName] =
    specifier.match(/^(spica-node)\/(\w+)$/) ?? [];

  if (!pkgName || !moduleName) return specifier;

  console.log(`converted to`, `${pkgName}/dist/${moduleName}.js`);

  return specifier;
  // return `${pkgName}/dist/${moduleName}.js`;
};

export const resolve = async (specifier, context, nextResolve) => {
  return resolveExtensionless(specifier, context, (s, c, n) =>
    nextResolve(resolveSpecifierJs(s), c, n)
  );
};
