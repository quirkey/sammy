/**
 * This is necessary when evaluating functions,
 * because mocha is calling them with an Assertion
 * as context instead of the original context.
 */
function bind(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  };
}

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
  app.$element = function() { return $('.doesNotExist'); };
  callback();
  app.$element = origElement;
  done();
}

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
}

/**
 * Runs the callback the second time the
 * function is called.
 */
function evaluateSecondCall(callback) {
  var i = 0;

  return function() {
    if(i == 1) {
      callback();
    }
    
    i += 1;
  };
}

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


/**
 * IE8 fixes
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length >>> 0;
 
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0) {
      from += len;
    }
 
    for (; from < len; from++) {
      if (from in this &&
          this[from] === elt) {
            return from;
          }
    }

    return -1;
  };
}