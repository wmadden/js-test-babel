function newTestContext() {
  const tests = [];

  const context = {
    tests,
    it(description, definition) {
      tests.push({
        description,
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
    run() {
      return tests[0].run();
    },
  };

  return context;
}

function TestRunner() {
  return newTestContext();
}

export default TestRunner;
