# jasmine-jquery

jasmine-jquery provides two extensions for [Jasmine](http://pivotal.github.com/jasmine/) JavaScript Testing Framework:
  
- a set of custom matchers for jQuery framework
- an API for handling HTML fixtures in your specs
  
## Installation

Simply download _jasmine-jquery.js_ from the [downloads page](http://github.com/velesin/jasmine-jquery/downloads) and include it in your Jasmine's test runner file (or add it to _jasmine.yml_ file if you're using Ruby with [jasmine-gem](http://github.com/pivotal/jasmine-gem)). Remember to include also jQuery library as jasmine-jquery relies on it.

## jQuery matchers

jasmine-jquery provides following custom matchers (in alphabetical order):

- `toBe(jQuerySelector)`
  - e.g. `expect('<div id="some-id"></div>').toBe('div#some-id')`
- `toBeChecked()`
  - only for tags that have checked attribute
  - e.g. `expect('<input type="checkbox" checked="checked"/>').toBeChecked()` 
- `toBeEmpty()`  
- `toBeHidden()`
- `toBeSelected()`
  - only for tags that have selected attribute
  - e.g. `expect('<option selected="selected"></option>').toBeSelected()`
- `toBeVisible()`
- `toContain(jQuerySelector)`
  - e.g. `expect('<div><span class="some-class"></span></div>').toContain('span.some-class')`
- `toExist()`
- `toHaveAttr(attributeName, attributeValue)`
  - attribute value is optional, if omitted it will check only if attribute exists
- `toHaveClass(className)`
  - e.g. `expect('<div class="some-class"></div>').toHaveClass("some-class")`  
- `toHaveData(key, value)`
  - value is optional, if omitted it will check only if an entry for that key exists
- `toHaveHtml(string)`
  - e.g. `expect('<div><span></span></div>').toHaveHtml('<span></span>')`
- `toHaveId(id)`
  - e.g. `expect('<div id="some-id"></div>').toHaveId("some-id")`
- `toHaveText(string)`
  - e.g. `expect('<div>some text</div>').toHaveText('some text')`
- `toHaveValue(value)`
  - only for tags that have value attribute
  - e.g. `expect('<input type="text" value="some text"/>').toHaveValue('some text')`
 
The same as with standard Jasmine matchers, all of above custom matchers may be inverted by using `.not` prefix, e.g.:

    expect('<div>some text</div>').not.toHaveText('other text')

## Fixtures

Fixture module of jasmine-jquery allows you to load HTML content to be used by your tests. The overall workflow is like follows:

In _myfixture.html_ file:
    <div id="my-fixture">some complex content here</div>
    
Inside your test:
    loadFixture(myfixture.html);
    $('#my-fixture').myTestedPlugin();
    expect($('#my-fixture')).to...;
    
Your fixture is being loaded into `<div id="jasmine-fixtures"></div>` container that is automatically added to the DOM by the Fixture module (If you _REALLY_ must change id of this container, try: `jasmine.getFixtures().containerId = 'my-new-id';` in your test runner). To make tests fully independent, fixtures container is automatically cleaned-up between tests, so you don't have to worry about left-overs from fixtures loaded in preceeding test. Also, fixtures are internally cached by the Fixture module, so you can load the same fixture file in several tests without penalty to your test suite's speed.

To invoke fixture related methods, obtain Fixtures singleton through a factory and invoke a method on it:

    jasmine.getFixtures().load(...);
    
There are also global short cut functions available for the most used methods, so the above example can be rewritten to just:

    loadFixtures(...);
    
Several methods for loading fixtures are provided:

- `load(fixtureUrl[, fixtureUrl, ...])`
  - Loads fixture(s) from one or more files and automatically appends them to the DOM (to the fixtures container).
- `read(fixtureUrl[, fixtureUrl, ...])`
  - Loads fixture(s) from one or more files but instead of appending them to the DOM returns them as a string (useful if you want to process fixture's content directly in your test).
- `set(html)`
  - Doesn't load fixture from file, but instead gets it directly as a parameter (html parameter may be a string or a jQuery element, so both `set('<div></div>')` and `set($('<div/>'))` will work). Automatically appends fixture to the DOM (to the fixtures container). It is useful if your fixture is too simple to keep it in an external file or is constructed procedurally, but you still want Fixture module to automatically handle DOM insertion and clean-up between tests for you.
  
All of above methods have matching global short cuts:

- `loadFixtures(fixtureUrl[, fixtureUrl, ...])`
- `readFixtures(fixtureUrl[, fixtureUrl, ...])`
- `setFixtures(html)`

Also, a helper method for creating HTML elements for your tests is provided:

- `sandbox([{attributeName: value[, attributeName: value, ...]}])`

It creates an empty DIV element with a default id="sandbox". If a hash of attributes is provided, they will be set for this DIV tag. If a hash of attributes contains id attribute it will override the default value. Custom attributes can also be set. So e.g.:

    sandbox();
    
Will return:

    <div id="sandbox"></div>    
    
And:

    sandbox({
      id: 'my-id',
      class: 'my-class',
      myattr: 'my-attr'
    });
    
Will return:

    <div id="my-id" class="my-class" myattr="my-attr"></div>

Sandbox method is useful if you want to quickly create simple fixtures in your tests without polluting them with HTML strings:

    setFixtures(sandbox({class: 'my-class'}));
    $('#sandbox').myTestedClassRemoverPlugin();
    expect($('#sandbox')).not.toHaveClass('my-class');

This method also has a global short cut available:

- `sandbox([{attributeName: value[, attributeName: value, ...]}])`

Additionally, two clean up methods are provided:

- `clearCache()`
  - purges Fixture module internal cache (you should need it only in very special cases; typically, if you need to use it, it may indicate a smell in your test code)
- `cleanUp()`
  - cleans-up fixtures container (this is done automatically between tests by Fixtures module, so there is no need to ever invoke this manually, unless you're testing a really fancy special case and need to clean-up fixtures in the middle of your test)
  
These two methods do not have global short cut functions.

## Supported browsers and jQuery versions

jasmine-jquery was tested for jQuery 1.4 on IE, FF, Chrome and Opera.

