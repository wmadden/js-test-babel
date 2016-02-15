import chalk from "chalk";
import itTest from "./it_test";
import describeTest from "./describe_test";
// import beforeTest from "./before_test";
// import afterTest from "./after_test";

function printSeparator() {
  /* eslint-disable max-len, no-console */
  console.log(chalk.blue("\n----------------------------------------------------------------------------------------------------\n"));
}

printSeparator();
const allTestsPassed = (
  itTest() &&
  describeTest()
  // beforeTest() &&
  // afterTest();
);
printSeparator();

process.exit(allTestsPassed ? 0 : 1);
