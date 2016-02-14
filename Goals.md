# Goals

The state of JavaScript testing tools is not good enough.

## What I don't like

Here are the things I don't like about testing in JavaScript:

* Mocha:
  * It's too complicated. Nobody needs to be able to swap expectation frameworks. Also nobody needs X-Unit style syntax.
  * However the built-in promises handling is great
  * Shared test context is stupid - I don't understand why the `this` object is shared between tests, although that
    may have been removed by now
* Chai:
  * Has too much black magic to make English-like expectations: in particular, you can never be certain of whether or
    not a matcher should be invoked like a function or not (e.g. `expect(x).to.be.empty` vs. `expect(x).to.be.empty()`),
    and if you get it wrong there are catastrophic effects.
  * Even worse, there are almost-indistinguishable matchers with different meanings (like `eql` vs. `equal`)
  * Is too complicated: flags in chains look kinda cool but add more complexity to matcher implementation and if you
    don't use them correctly can have unexpected effects
* Sinon:
  * XHR expectation syntax is cumbersome: it's difficult to describe the behaviour you want and hard to understand test
    failures
  * Spies are not removed automatically unless you set up and destroy a sandbox
  * Sinon-chai: expectations are not super helpful
* Chai-as-promised:
  * Has no implementation of the `wait-for` pattern
  * Same flaws as Chai
* Jasmine:
  * No support for promises
  * Ajax support is better than Sinon, but not as good as Ruby
* Tape:
  * Supports TAP syntax, which is neat, but I assume that a formatter for the other frameworks would do the same
  * Leaves a lot of work for the user
* Supertest / super-agent:
  * Shits all over Sinon and Jasmine AJAX expectations
* Everything:
  * No English-like single-line syntax
  * Test runners all suck, because they need to know how to construct your project. Except Karma, which seems to be
    pretty clever.
  * Most test frameworks install global functions

## Things it *should* do

First and foremost: you should spend more time writing the application than the tests

* You should not need to spend your time:
  * Setting it up
  * Learning how to write the tests
  * Debugging the tests (as opposed to the code under test)
  * It should be easy to write setup/fixture code that's not shared between tests and is cleaned up automatically
* Tests should form usable documentation for the object under test
* Tests should fail due to mistakes in the tests as rarely as possible
* When tests fail they should clearly indicate what the erroneous behaviour was - i.e. it should make it easy to tell
  what the error in the code under test was
* It should be super easy to add matchers specific to your application - or even module under test

## Things it *shouldn't* do

* Compile and search the filesystem - use Karma
* Modify global state

## Plan

* Jasmine syntax
* Equivalent matchers to Tape
* No stupid chaining syntax like Chai
* Only `expect` syntax, no `should` syntax
* Only `before`, no `each` or `all` variants
* Allow Promise or Generator return values for async tests
* Rely heavily on custom matchers, and make them super easy to add
  * Matchers should be composable
* Should have a one-liner syntax

## Possible Usage

```javascript
import { describe, subject, it, context } from "testrunner";
import ConversationScreen from "views/ConversationScreen";

describe("ConversationScreen", () => {
  var conversationScreen = new ConversationScreen();

  describe("while the conversation is still loading", () => {
    conversationScreen.loading = true;

    it("should show a loading spinner", () => {
      expect(conversationScreen).toShowALoadingSpinner();
    });

    describe("but has been loaded previously", () => {
      conversationScreen.cachedContent = {};

      it("shows the previously loaded content", () => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", () => {
      it("shows an empty message", () => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });
  });

});
```


```javascript
// Vanilla BDD-style
// Pros:
//   * Just JavaScript - no magic
//   * No shared state
//   * Everything falls out of scope ouside the `describe` block
//   * Nests nicely
// Cons:
//   * You can make mistakes: if you don't assign the value in a beforeEach
//   * The framework has no control - can't clean up for you

import ConversationScreen from "views/ConversationScreen";

describe("ConversationScreen", () => {
  var conversationScreen;

  beforeEach( () => {
    conversationScreen = new ConversationScreen();
  });

  describe("while the conversation is still loading", () => {
    beforeEach( () => {
      conversationScreen.loading = true;
    });

    it("should show a loading spinner", () => {
      expect(conversationScreen).toShowALoadingSpinner();
    });

    describe("but has been loaded previously", () => {
      beforeEach( () => {
        conversationScreen.cachedContent = {};
      });

      it("shows the previously loaded content", () => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", () => {
      it("shows an empty message", () => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });
  });

});
```

```javascript
// this-style
// Pros:
//   * Framework has control, this value is destroyed between test runs
// Cons:
//   * Won't work with arrow functions
//   * Requires the use of `this` (and everywhere, too)

import ConversationScreen from "views/ConversationScreen";

describe("ConversationScreen", function() {
  beforeEach( function() {
    this.conversationScreen = new ConversationScreen();
  });

  describe("while the conversation is still loading", function() {
    beforeEach( function() {
      this.conversationScreen.loading = true;
    });

    it("should show a loading spinner", function() {
      expect(this.conversationScreen).toShowALoadingSpinner();
    });

    describe("but has been loaded previously", function() {
      beforeEach( function() {
        this.conversationScreen.cachedContent = {};
      });

      it("shows the previously loaded content", function() {
        expect(this.conversationScreen).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", function() {
      it("shows an empty message", function() {
        expect(this.conversationScreen).toHaveContent(<message/>);
      });
    });
  });

});
```

```javascript
// Exposed context style
// Pros:
//   * Framework has control
//   * No shared state
//   * Hard to make mistakes
// Cons:
//   * Two kinds of function: describe and context, which run at different times
//   * Can you nest `it` inside `context`?
//   * Verbose repetition of `{ conversationScreen }`

import ConversationScreen from "views/ConversationScreen";

describe("ConversationScreen", () => {
  context( () => {
    conversationScreen: new ConversationScreen(),
  });

  describe("while the conversation is still loading", () => {
    context( ({ conversationScreen }) => {
      conversationScreen.loading = true;
    });

    it("should show a loading spinner", ({ conversationScreen }) => {
      expect(conversationScreen).toShowALoadingSpinner();
    });

    describe("but has been loaded previously", () => {
      context( ({ conversationScreen }) => {
        conversationScreen.cachedContent = {};
      });

      it("shows the previously loaded content", ({ conversationScreen }) => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", () => {
      it("shows an empty message", ({ conversationScreen }) => {
        expect(conversationScreen).toHaveContent(<message/>);
      });
    });
  });

});
```

```javascript
// Exposed context style with subject
// Pros:
//   * One liner syntax is feasible
//   * `given` is clearer than `context` or `before`
// Cons:
//   * `given` is not conventional, normally used with given/when/then syntax
//   * Outer `describe` syntax is a bit confusing
//   * Can't hook up one `given` to the results of previous ones as you can in RSpec
//   * Subject declaration is awkward without shadowing global `subject` function

import ConversationScreen from "views/ConversationScreen";
import { describe, given, it } from "testrunner";

describe({ "ConversationScreen": () => new ConversationScreen() }, () => {

  describe("while the conversation is still loading", () => {
    given( ({ subject }) => subject.loading = true );

    it.isExpected().toShowALoadingSpinner();

    describe("but has been loaded previously", () => {
      given( ({ subject }) => subject.cachedContent = {} );

      it("shows the previously loaded content", ({ subject }) => {
        expect(subject).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", () => {
      it.isExpected.toHaveContent(<message/>);
    });
  });
});
/*
  given(() => {
    conversationScreen: () => new ConversationScreen(),
  });
  // Or
  given({ conversationScreen: () => new ConversationScreen() });
  // Or
  given( 'conversationScreen', () => new ConversationScreen() );
  subject( ({ conversationScreen }) => conversationScreen );
*/
```


```javascript
// Exposed context style with subject
// Pros:
// Cons:

import ConversationScreen from "views/ConversationScreen";
import { describe, given, it } from "testrunner";

describe( "ConversationScreen", () => {
  defineSubject( { someDependency } => new ConversationScreen(someDependency) );

  describe("when some dependency is not ready", () => {
    given(() => { someDependency: () => new Dependency({ ready: false }) });

    // Subject is not executed until here, when `someDependency` has been declared
    it.isExpected.toShowALoadingSpinner();

    it("shows a loading spinner", () => expect(subject()).toShowALoadingSpinner() );
  });

  describe("while the conversation is still loading", () => {
    given( () => subject().loading = true );

    it.isExpected().toShowALoadingSpinner();

    describe("but has been loaded previously", () => {
      given( ({ subject }) => subject.cachedContent = {} );

      it("shows the previously loaded content", ({ subject }) => {
        expect(subject).toHaveContent(<message/>);
      });
    });

    describe("and no content has been previously loaded", () => {
      it.isExpected.toHaveContent(<message/>);
    });
  });

});
/*
  given(() => {
    conversationScreen: () => new ConversationScreen(),
  });
  // Or
  given({ conversationScreen: () => new ConversationScreen() });
  // Or
  given( 'conversationScreen', () => new ConversationScreen() );
  subject( ({ conversationScreen }) => conversationScreen );
*/
```

```javascript

import ConversationScreen from 'views/ConversationScreen';
import test from 'test';

// Function must have a name
describe( ConversationScreen, () => {
  before({ conversationScreen: () => new ConversationScreen() });

  describe('the data is still loading', () => {
    before(({ conversationScreen }) => conversationScreen.loading = true);

    expect(({ conversationScreen }) => conversationScreen.showsALoadingSpinner() );
  });

})

// Magic setup methods recreate object on each test run
describe( ConversationScreen, () => {
  var aDependency;
  var conversationScreen = setup(() => new ConversationScreen({ aDependency }));

  when('the data is still loading', () => {
    setup(() => conversationScreen().loading = true);

    expect(conversationScreen).toShowALoadingSpinner());
  });

  when('a dependency has not loaded', () => {
    aDependency = setup(() => new Dependency());
    conversationScreen = setup(() => new ConversationScreen({ aDependency }));
  });
})

describe( ConversationScreen, () => {
  context(() => { conversationScreen: new ConversationScreen() })

  describe('when the data is still loading', () => {
    context(({ conversationScreen }) => conversationScreen.loading = true);

    it('shows a loading spinner', ({ conversationScreen }) => {
      expect(conversationScreen).toShowALoadingSpinner();
    });
  });
})

```
