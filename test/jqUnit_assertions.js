(function($) {
  
  $.extend(jqUnit, {
    // like rspec/bacon describe, sort of
    describe: function() {
      var args = [].splice.call(arguments, 0);
      return jqUnit.module('describe: ' + args.join(' '));
    },
    
    // shortcut to append 'should' to tests
    should: function(name, callback, nowait) {
      return jqUnit.test('should ' + name, callback, nowait);
    },
    
    // asserts that the method is defined (like respond_to?)
    defined: function(object, method) {
      return jqUnit.ok(typeof object[method] != 'undefined', method + 'is not defined on' + object);
    },
    
    // asserts that the object is of a certain type
    isType: function(object, type) {
      return jqUnit.ok(object.constructor === type, object + 'is not of type' + type);
    }
    
  });
  
})(jQuery);
