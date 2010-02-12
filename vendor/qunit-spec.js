(function($) {

  jqUnit.Spec = function(name) {
    this.before = false;
    this.after = false;
    jqUnit.module(name);
  };


  // RSpec style describe
  // takes an arbitrary number of arguments that are contactenated as strings
  // the last argument is the configuration object
  // which can have before: after: callbacks
  function describe() {
    var args = $.makeArray(arguments),
    // configuration function
      config = (args.length > 0 && args[args.length - 1]['before']) ? args.pop() : {},
      spec = new jqUnit.Spec(args.join(' '));
    spec['before'] = config['before'] || config['setup'];
    spec['after']  = config['after'] || config['teardown'];
    return spec;
  }


  $.extend(jqUnit.Spec.prototype, {
    
    // RSpec style test definition
    it: function(name, callback, nowait) {
      var spec = this;
      var spec_context = {};
      jqUnit.test(name, function() { 
        if (spec.before) spec.before.apply(spec_context);
        callback.apply(spec_context, [this]); 
        if (spec.after) spec.after.apply(spec_context);
      }, nowait);
      return spec;
    },

    // Shoulda style test definition
    should: function(name, callback, nowait) {
      name = 'should ' + name;
      return this.it.apply(this, [name, callback, nowait]);
    },
    
    pending: function(name, callback, nowait) {
      name = '<span style="color: #EB8531;" class="pending">DEFERRED: ' + name + '</span>';
      jqUnit.test(name, function () { jqUnit.ok(true) }, nowait);
      return this;
    },
    
    should_eventually: function(name, callback, nowait) {
      return this.pending(name, callback, nowait);
    }
    
  });


  $.extend(jqUnit, {
    // aliases for describe
    describe: describe,
    context: describe,

    // asserts that the method is defined (like respond_to?)
    defined: function(object, method) {
      return jqUnit.ok(typeof object[method] == 'function', method + 'is not defined on' + object);
    },

    // asserts that the object is of a certain type
    isType: function(object, type) {
      return jqUnit.equals(object.constructor, type);
    },
    
    // assert a string matches a regex
    matches: function(matcher, string, message) {
      return jqUnit.ok(!!matcher.test(string), "expected: " + string + "match(" + matcher.toString() + ")");
    },
    
    // assert that a matching error is raised
    // expected can be a regex, a string, or an object
    raised: function(expected_error, callback) {
      var error = '';
      try {
        callback.apply(this);
      } catch(e) {
        error = e;
      }
      message = "expected error: " + expected_error.toString() + ", actual error:" + error.toString();
      if (expected_error.constructor == RegExp) {
        return jqUnit.matches(expected_error, error.toString(), message);
      } else if (expected_error.constructor == String) {
        return jqUnit.equals(expected_error, error.toString(), message);
      } else {
        return jqUnit.equals(expected_error, error, message);
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
      jqUnit.equals('', error, message);
    },
    
    soon: function(callback, context, secs, many_expects) {
      if (typeof context == 'undefined') context = this;
      if (typeof secs == 'undefined') secs = 1;
      if (typeof many_expects == 'undefined') many_expects = 1;
      jqUnit.expect(many_expects);
      jqUnit.stop();
      setTimeout(function() {
        callback.apply(context);
        jqUnit.start();
      }, secs * 500);
    },
    
    flunk: function() {
      jqUnit.ok(false, 'FLUNK');
    }

  });


})(jQuery);
