import chalk from "chalk";

export default function assert(truthy, message) {
  /* eslint-disable no-console */
  if (truthy) {
    console.log(chalk.green(`✓ ${message}`));
  } else {
    const error = { toString: () => `✗ ${message}` };
    Error.captureStackTrace(error, assert);
    console.error(chalk.red(error.stack));
  }

  return truthy;
}
