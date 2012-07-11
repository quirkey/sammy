/*
 * This is necessary when evaluating functions,
 * because mocha is calling them with an Assertion
 * as context instead of the original context.
 *
 */
function bind(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

/*
 * Disables the Sammy trigger mechanism by
 * setting an invalid element as $element.
 *
 * This is for example necessary when triggering
 * errors, because mocha is going to catch those
 * and display them as errors, even if we catch
 * the original error with throwException().
 *
 */
function disableTrigger(context, callback, done) {
  var origElement = context.app.$element;
  context.app.$element = function() { return $('.doesNotExist'); }
  callback();
  context.app.$element = origElement;
  done();
};

/*
 * Sets up an environment where it is possible
 * to listen to the "changed" event which is 
 * triggered by "swap", "appendTo", etc.
 *
 */
function listenToChanged(app, callbacks) {
  app.get('/', function() {});
  app.run();
  app.bind('changed', callbacks.onChange);
  callbacks.setup();  
};