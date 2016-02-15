function newTestContext(parentContext, description) {
  const tests = [];
  const childContexts = [];

  const context = {
    tests,
    childContexts,
    parentContext,
    description,
    it(testDescription, definition) {
      tests.push({
        description: testDescription,
        definition,
        run: () => {
          try {
            definition();
            return { success: true };
          } catch (error) {
            return { success: false, error };
          }
        },
      });
    },
    createChildContext(childContextDescription) {
      const childContext = newTestContext(context, childContextDescription);
      childContexts.push(childContext);
      return childContext;
    },
    run() {
      const testResults = tests.map((test) => test.run());
      return testResults.reduce(({ success, failedTests, successfulTests }, testResult) => {
        if (testResult.success) successfulTests.push(testResult);
        if (!testResult.success) failedTests.push(testResult);
        return { success: success && testResult.success, failedTests, successfulTests };
      }, { success: true, failedTests: [], successfulTests: [] });
    },
  };

  return context;
}

function TestRunner() {
  const rootContext = newTestContext();
  let currentContext = rootContext;

  function describe(description, definition) {
    const newContext = currentContext.createChildContext(description);
    currentContext = newContext;
    definition();
  }

  function it(...args) {
    currentContext.it(...args);
  }

  return Object.assign(Object.create(rootContext), {
    describe,
    it,
  });
}

export default TestRunner;
