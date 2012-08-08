/**
 * This is necessary when evaluating functions,
 * because mocha is calling them with an Assertion
 * as context instead of the original context.
 */
function bind(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

/**
 * Disables the Sammy trigger mechanism by
 * setting an invalid element as $element.
 *
 * This is for example necessary when triggering
 * errors, because mocha is going to catch those
 * and display them as errors, even if we catch
 * the original error with throwException().
 */
function disableTrigger(app, callback, done) {
  var origElement = app.$element;
  app.$element = function() { return $('.doesNotExist'); }
  callback();
  app.$element = origElement;
  done();
};

/**
 * Sets up an environment where it is possible
 * to listen to the "changed" event which is 
 * triggered by "swap", "appendTo", etc.
 */
function listenToChanged(app, callbacks) {
  app.get('#/', function() {});
  app.run('#/');
  app.bind('changed', callbacks.onChange);
  callbacks.setup();  
};


/**
 * Test if a jquery element has the same HTML
 * as the given string.
 */
expect.Assertion.prototype.sameHTMLAs = function(obj) {
  var strippedHTML = function(element) {
    return $(element).wrap('<div></div>').parent().html().toString().replace(/(>)(\s*)(<)/g, "><");
  };

  this.assert(
      strippedHTML(obj) === strippedHTML(this.obj)
    , 'expected ' + strippedHTML(this.obj) + ' to have the same html as ' + strippedHTML(obj)
    , 'expected ' + strippedHTML(this.obj) + ' to not have the same html as ' + strippedHTML(obj));
  return this;
};