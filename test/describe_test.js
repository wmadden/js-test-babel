import TestRunner from "../src/TestRunner";
import assert from "./assert";

/* eslint-disable no-console */

function testSuccess() {
  console.log("A describe() block should succeed if its it() blocks succeed");
  const testContext = TestRunner();
  const { describe, it } = testContext;

  describe("A describe block", () => {
    it("should pass", () => null);
    it("should also pass", () => null);
  });

  const describedContext = testContext.childContexts[0];
  let result = assert(describedContext.tests.length === 2, "Expected two tests to be recorded");
  result = result && assert(describedContext.run().success, "Expected described context to pass");
  return result;
}

function testFailure() {
  console.log("A describe() block should fail if any of its it() blocks fail");
  const testContext = TestRunner();
  const { describe, it } = testContext;

  describe("A describe block", () => {
    it("should pass", () => null);
    it("should fail", () => { throw new Error(); });
  });

  const describedContext = testContext.childContexts[0];
  let result = assert(describedContext.tests.length === 2, "Expected two tests to be recorded");
  result = result && assert(!describedContext.run().success, "Expected described context to fail");
  return result;
}

function testMetaInformation() {
  console.log("A describe() block should record its description");
  const testContext = TestRunner();
  const { describe, it } = testContext;
  const contextDescription = "The test";
  const testDescription = "should have a constructed description";

  describe(contextDescription, () => {
    it(testDescription, () => null);
  });

  const actualDescription = testContext.childContexts[0].description;
  return (
    assert(testContext.childContexts[0].tests.length === 1, "Expected one test to be recorded") &&
    assert(
      actualDescription === contextDescription,
      `Expected context description to be '${contextDescription}' but it was '${actualDescription}'`
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
