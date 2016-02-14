import TestRunner from "../src/TestRunner";
import assert from "./assert";

/* eslint-disable no-console */

function testSuccess() {
  console.log("An it() block should succeed if it doesn't throw an error");
  const testContext = TestRunner();
  const { it } = testContext;
  it("should pass", () => null);

  return (
    assert(testContext.tests.length === 1, "Expected one test to be recorded") &&
    assert(testContext.tests[0].run().success, "Expected test to pass") &&
    assert(testContext.run().success, "Expected test context to pass")
  );
}

function testFailure() {
  console.log("An it() block should fail if it throws an error");
  const testContext = TestRunner();
  const { it } = testContext;
  it("should fail", () => { throw new Error("throwing an error"); });

  return (
    assert(testContext.tests.length === 1, "Expected one test to be recorded") &&
    assert(testContext.tests[0].run().success === false, "Expected test to fail") &&
    assert(testContext.run().success === false, "Expected test context to fail")
  );
}

function testMetaInformation() {
  console.log("An it() block should record its description");
  const testContext = TestRunner();
  const { it } = testContext;
  const description = "should have a description";
  it(description, () => null);

  return (
    assert(testContext.tests.length === 1, "Expected one test to be recorded") &&
    assert(
      testContext.tests[0].description === description,
      `Expected test description to be '${description}'`
    )
  );
}

export default function itTest() {
  return (
    testSuccess() &&
    testFailure() &&
    testMetaInformation()
  );
}
