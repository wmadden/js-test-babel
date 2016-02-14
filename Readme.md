# js-test

I was thoroughly sick of the existing bloated test frameworks (I'm looking at
you, Mocha) so I decided to write my own.

# Usage

It's just JavaScript. Include it on Node or in the Browser, declare and run
your tests.

```javascript
// test.js
import { runner } from 'js-test';

// Optional configuration
const TestRunner = runner();

runner.before(() => {
  // Do something before all tests
});

runner.after(() => {
  // Do something after all tests
});

// Create a custom matcher
runner.matcher('beAwesome', {
  test: (actual) => { !!actual.isAwesome },

  // This forms the message:
  //   ERROR: expected ${actual} to ${not} have a truthy 'isAwesome' property,
  //   but it was undefined
  expected: () => { `have a truthy 'isAwesome' property` },
  observed: (actual) => { `it was ${actual.isAwesome}` },

  // Enable diffing actual and expected output. You can transform the actual value here to control the
  // output diff. You must also specify the expected value.
  diff: (actual, args...) => { actual, expected: args[0] },
};

// test/MyClass-spec.js
import { describe, matcher, before, it } from 'test';
import MyClass from 'MyClass'

describe(MyClass, () => {
  before(function() {
    myClass = new MyClass();
  });

  it("can't rely on the `this` keyword", () => {
    expect(this).toNot.beDefined();
  });

  it("is awesome", function() {
    expect(myClass).to.beAwesome();
  });
});

// Using `subject()` you can take advantage of one-liner syntax
describe( MyClass, () => {
  subject(() => new MyClass());

  it(() => isExpected().to.beAwesome());

  it("is awesome", () => expect(subject()).to.beAwesome);
});

// Async tests with Promises
describe( MyClass, () => {
  subject(() => new MyClass());

  it("does something async", () => {
    return subject().doSomethingAsync().then((result) => {
      expect(result).to.equal(true);
    });
  });
});
```

# Things it can do

Standard BDD-style test methods:

- `describe(description, suiteFn)`
- `before(hookFn)`
- `after(hookFn)`
- `it(description, specFn)`

If any of the `hookFn` or `specFn` functions returns a Promise or a generator, execution will
wait for it to complete.

# Logging

`declare()` returns a test runner factory which takes as its only argument a
logger instance.

The logger looks like this:

```javascript
{
  enterContext: function({ description }) {},

  executeTest: function({ description }) {},

  testCompleted: function({ description, result: { successful, error } }) {},

  leaveContext: function({ description }) {},

  executeHook: function({ type, func }) {}
}
```

The objects passed in are the internal representations of contexts, tests and
hooks, which have other properties but guarantee to conform to this interface.

# Test Runner

The test runner returned by the `declare()` factory looks like this:

```javascript
{
  run: function() {}
}
```

It will run your tests.
