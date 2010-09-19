(function($) {
  with(QUnit) {

    var stores = ['memory', 'data', 'local', 'session', 'cookie'];

    $.each(stores, function(i, store_type) {
      if (Sammy.Store.isAvailable(store_type)) {
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
          equal(this.store.type, store_type);
        })
        .should('set name', function() {
          equal(this.store.name, 'test_store');
        })
        .should('set the element', function() {
          equal(this.store.element, '#main');
        })
        .should('check if a key exists', function() {
          ok(!this.store.exists('foo'));
          this.store.set('foo', 'bar');
          ok(this.store.exists('foo'));
          ok(!this.other_store.exists('foo'));
        })
        .should('set and retrieve value as string', function() {
          ok(this.store.set('foo', 'bar'));
          equal(this.store.get('foo'), 'bar');
          ok(!this.other_store.get('foo'));
        })
        .should('set and retrieve value as JSON', function() {
          var obj = {'obj': 'is json'};
          equal(this.store.set('foo', obj), obj);
          equal(this.store.get('foo').obj,'is json');
          ok(!this.other_store.get('foo'));
        })
        .should('should store in global space accessible by name', function() {
          this.store.set('foo', 'bar');
          var new_store = new Sammy.Store(this.store_attributes);
          equal(new_store.get('foo'), 'bar');
        })
        .should('clear value', function() {
          ok(this.store.set('foo', 'bar'));
          ok(this.other_store.set('foo', 'bar'));
          equal(this.store.get('foo'), 'bar');
          this.store.clear('foo');
          ok(!this.store.exists('foo'));
          ok(this.other_store.get('foo'), 'bar');
        })
        .should('return list of keys', function() {
          this.store.set('foo', 'bar');
          this.store.set('blurgh', {boosh: 'blurgh'});
          this.store.set(123, {boosh: 'blurgh'});
          deepEqual(this.store.keys(), ['foo', 'blurgh', '123']);
          deepEqual(this.other_store.keys(), []);
        })
        .should('iterate over keys and values', function() {
          this.store.set('foo', 'bar');
          this.store.set('blurgh', {boosh: 'blurgh'});
          var keys = [], values = [];
          this.store.each(function(key, value) {
            keys.push(key); values.push(value);
          });
          deepEqual(keys, ['foo', 'blurgh']);
          deepEqual(values, ['bar', {boosh: 'blurgh'}]);
        })
        .should('clear all values', function() {
          this.store.set('foo', 'bar');
          this.store.set('blurgh', {boosh: 'blurgh'});
          this.store.set(123, {boosh: 'blurgh'});
          equal(this.store.keys().length, 3);
          this.store.clearAll();
          equal(this.store.keys().length, 0);
          ok(!this.store.exists('blurgh'));
        })
        .should('filter values with a callback', function() {
          this.store.set('foo', 'bar');
          this.store.set('blurgh', 'blargh');
          this.store.set('boosh', 'blargh');
          var returned = this.store.filter(function(key, value) {
            return (value === "blargh");
          });
          deepEqual(returned, [['blurgh', 'blargh'], ['boosh', 'blargh']]);
        })
        .should('return first value that matches a callback', function() {
          this.store.set('foo', 'bar');
          this.store.set('blurgh', 'blargh');
          this.store.set('boosh', 'blargh');
          var returned = this.store.first(function(key, value) {
            return (value === "blargh");
          });
          deepEqual(returned, ['blurgh', 'blargh']);
        })
        .should('fire specific key event on set', function() {
          var fired = false;
          $('#main').bind('set-test_store-foo', function(e, data) {
            fired = data.value;
          });
          this.store.set('foo', 'bar');
          soon(function() {
            equal(fired, 'bar');
            $('#main').unbind('set-test_store-foo');
          });
        })
        .should('fire store event on set', function() {
          var fired = false;
          $('#main').bind('set-test_store', function(e, data) {
            fired = data.key;
          });
          this.store.set('foo', 'bar');
          soon(function() {
            equal(fired, 'foo');
            $('#main').unbind('set-test_store');
          });
        })
        .should('fetch value or run callback', function() {
          ok(!this.store.get('foo'));
          this.store.fetch('foo', function() {
            return "bar";
          });
          equal(this.store.get('foo'), 'bar');
          equal(this.store.fetch('foo', function() {
            return "baz";
          }), 'bar');
          equal(this.store.get('foo'), 'bar');
        })
        .should('load file into a key', function() {
          ok(!this.store.get('foo'));
          this.store.load('foo', 'fixtures/partial');
          soon(function() {
            equal(this.store.get('foo'), 'NOENGINE');
          }, this, 2, 2);
        });
      }
    });

      context('Sammy.Storage', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Storage);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('add the store method to the app', function() {
        ok($.isFunction(this.app.store));
      })
      .should('add the store method to event contexts', function() {
        ok($.isFunction(this.context.store));
      });

      context('Sammy.Storage', 'store', {
        before: function() {
          var store = null;
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Storage);
            store = this.store('session');
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
          store.clearAll();
          this.store = store;
        }
      })
      .should('create a new sammy store if it doesnt exist', function() {
        ok(this.store);
        ok($.isFunction(this.store.get));
      })
      .should('add the a named method shortcut to the app', function() {
        ok($.isFunction(this.app.session));
      })
      .should('add a named method shortcut to the event contexts', function() {
        ok($.isFunction(this.context.session));
      })
      .should('should set value if value is passed', function() {
        this.context.session('foo', 'bar')
        equal(this.store.get('foo'), 'bar');
      })
      .should('should get value if no value is passed', function() {
        this.store.set('foo', 'bar');
        equal(this.context.session('foo'), 'bar');
      })
      .should('call fetch if callback is passed', function() {
        ok(!this.store.get('foo'));
        this.context.session('foo', function() {
          return "bar";
        });
        equal(this.store.get('foo'), 'bar');
        equal(this.context.session('foo', function() {
          return "baz";
        }), 'bar');
      })
      .should('add a clear store helper method', function() {
        ok($.isFunction(this.context.clearSession));
        this.context.session('foo', 'bar')
        equal(this.store.get('foo'), 'bar');
        equal(this.context.clearSession());
        ok(!this.store.get('foo'));
      });
  };
})(jQuery);
