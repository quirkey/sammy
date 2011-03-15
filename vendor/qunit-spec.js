(function() {

  QUnit.Spec = function(name) {
    this.before = false;
    this.after = false;
    QUnit.module(name);
  };

  function extend(a, b) {
    for ( var prop in b ) {
      a[prop] = b[prop];
    }
    return a;
  }

  // RSpec style describe
  // takes an arbitrary number of arguments that are contactenated as strings
  // the last argument is the configuration object
  // which can have before: after: callbacks
  function describe() {
    var args = Array.prototype.slice.call(arguments),
    // configuration function
      config = (args.length > 0 && args[args.length - 1]['before']) ? args.pop() : {},
      spec = new QUnit.Spec(args.join(' '));
    spec['before'] = config['before'] || config['setup'];
    spec['after']  = config['after'] || config['teardown'];
    return spec;
  }

  extend(QUnit.Spec.prototype, {

    // RSpec style test definition
    it: function(name, callback, nowait) {
      var spec = this;
      var spec_context = {};
      QUnit.test(name, function() {
        if (spec.before) spec.before.apply(spec_context);
        callback.apply(spec_context, [this, spec]);
        if (spec.after) spec.after.apply(spec_context);
      });
      return spec;
    },

    // Shoulda style test definition
    should: function(name, callback, nowait) {
      name = 'should ' + name;
      return this.it.apply(this, [name, callback, nowait]);
    },

    pending: function(name, callback, nowait) {
      name = '<span style="color: #EB8531;" class="pending">DEFERRED: ' + name + '</span>';
      return this.it.apply(this, [name, function () { QUnit.ok(true) }, nowait]);
    },

    should_eventually: function(name, callback, nowait) {
      return this.pending(name, callback, nowait);
    }

  });


  extend(QUnit, {
    // aliases for describe
    describe: describe,
    context: describe,

    // asserts that the method is defined (like respond_to?)
    defined: function(object, method) {
      return QUnit.ok(QUnit.is('Function', object[method]), method + ' is not defined on ' + object);
    },

    // asserts that the object is of a certain type
    isType: function(object, type) {
      return ok(QUnit.is(type, object), "expected " + object + " to be a " + type);
    },

    // assert a string matches a regex
    matches: function(matcher, string, message) {
      return QUnit.ok(!!matcher.test(string), message || "expected: " + string + "match(" + matcher.toString() + ")");
    },

    // assert that a matching error is raised
    // expected can be a regex, a string, or an object
    raised: function(expected_error, callback) {
      var error = null;
      try {
        callback.apply(this);
      } catch(e) {
        error = e;
      }
      error_message = error && error.message ? error.message.toString() : error.toString();
      message = "expected error: " + expected_error.toString() + ", actual error:" + error_message;
      if (expected_error.constructor == RegExp) {
        return QUnit.matches(expected_error, error_message, message);
      } else if (expected_error.constructor == String) {
        return QUnit.equal(expected_error, error_message, message);
      } else {
        return QUnit.deepEqual(expected_error, error, message);
      }
    },

    notRaised: function(callback) {
      var error = '';
      try {
        callback.apply(this);
      } catch(e) {
        error = e;
      }
      message = "expected: no errors, actual error: " + error.toString();
      QUnit.equal('', error, message);
    },

    soon: function(callback, context, secs, many_expects) {
      if (typeof context == 'undefined') context = this;
      if (typeof secs == 'undefined') secs = 1;
      if (typeof many_expects == 'undefined') many_expects = 1;
      QUnit.expect(many_expects);
      QUnit.stop();
      setTimeout(function() {
        callback.apply(context);
        QUnit.start();
      }, secs * 500);
    },

    flunk: function() {
      QUnit.ok(false, 'FLUNK');
    },

    sameHTML: function(actual, expected) {
      var strippedHTML = function(element) {
        return $(element)
          .wrap('<div></div>')
          .parent()
          .html()
          .toString()
          .replace(/(>)(\s+)(<)/g, "><");
      };

      actual = strippedHTML(actual);
      expected = strippedHTML(expected);
      equal(actual, expected, "HTML is equal");
    }

  });


})();
