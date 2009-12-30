(function($) {
  var stores = ['memory', 'data', 'local', 'session', 'cookie'];

  $.each(stores, function(i, store_type) {
    with(jqUnit) {
      context('Sammy.Store', store_type, {
        before: function() {
          this.store_attributes = {
            element: '#main',
            name: 'test_store',
            type: store_type
          };
          this.store = new Sammy.Store(this.store_attributes);
        
          this.other_store = new Sammy.Store({
            element: '#main',
            name: 'other_test_store',
            type: store_type
          });
          this.store.clearAll();
          this.other_store.clearAll();
        }
      })
      .should('set store type', function() {
        equals(this.store.type, store_type);
      })
      .should('set name', function() {
        equals(this.store.name, 'test_store');
      })
      .should('set the element', function() {
        equals(this.store.$element[0], $('#main')[0]);
      })
      .should('check if a key exists', function() {
        ok(!this.store.exists('foo'));
        this.store.set('foo', 'bar');
        ok(this.store.exists('foo'));
        ok(!this.other_store.exists('foo'));
      })
      .should('set and retrieve value as string', function() {
        ok(this.store.set('foo', 'bar'));
        equals(this.store.get('foo'), 'bar');
        ok(!this.other_store.get('foo'));
      })
      .should('set and retrieve value as JSON', function() {
        ok(this.store.set('foo', {'obj': 'is json'}));
        equals(this.store.get('foo').obj,'is json');
        ok(!this.other_store.get('foo'));
      })
      .should('should store in global space accessible by name', function() {
        this.store.set('foo', 'bar');
        var new_store = new Sammy.Store(this.store_attributes);
        equals(new_store.get('foo'), 'bar');
      })
      .should('clear value', function() {
        ok(this.store.set('foo', 'bar'));
        ok(this.other_store.set('foo', 'bar'));
        equals(this.store.get('foo'), 'bar');
        this.store.clear('foo');
        ok(!this.store.exists('foo'));
        ok(this.other_store.get('foo'), 'bar');
      })
      .should('return list of keys', function() {
        this.store.set('foo', 'bar');
        this.store.set('blurgh', {boosh: 'blurgh'});
        this.store.set(123, {boosh: 'blurgh'});
        isObj(this.store.keys(), ['foo', 'blurgh', '123'], "keys were " + this.store.keys().toString());
        isObj(this.other_store.keys(), []);
      })
      .should('clear all values', function() {
        this.store.set('foo', 'bar');
        this.store.set('blurgh', {boosh: 'blurgh'});
        this.store.set(123, {boosh: 'blurgh'});
        equals(this.store.keys().length, 3);
        this.store.clearAll();
        equals(this.store.keys().length, 0);
        ok(!this.store.exists('blurgh'));
      })
      .should('fire events on get and set', function() {
        var fired = false;
        $('#main').bind('set-test_store.foo', function(e, key, value) {
          fired = value;
        });
        this.store.set('foo', 'bar');
        soon(function() {
          equals(fired, 'bar');
          $('#main').unbind('set-test_store.foo');
        });
      }) 
      .should('fetch value or run callback', function() {
        ok(!this.store.get('foo'));
        this.store.fetch('foo', function() {
          return "bar";
        });
        equals(this.store.get('foo'), 'bar');
        this.store.fetch('foo', function() {
          return "baz";
        });
        equals(this.store.get('foo'), 'bar');
      })
    }
  });
})(jQuery);