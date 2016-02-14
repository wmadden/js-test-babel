import chalk from "chalk";
import itTest from "./it_test";

function printSeparator() {
  /* eslint-disable max-len, no-console */
  console.log(chalk.blue("\n----------------------------------------------------------------------------------------------------\n"));
}

printSeparator();
const allTestsPassed = itTest();
printSeparator();

process.exit(allTestsPassed ? 0 : 1);
