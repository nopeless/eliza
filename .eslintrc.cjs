// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(`nopeless-config/.eslintrc.cjs`);

module.exports = {
  ...config,
  ignorePatterns: [`legacy`, ...config.ignorePatterns],
};
