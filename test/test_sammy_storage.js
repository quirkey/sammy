(function($) {

  with(QUnit) {

    var stores = ['memory', 'local', 'session', 'cookie'];

    var i = 0, l = stores.length;
    for (; i < l; i++) {
      var store_type = stores[i];
      if (Sammy.Store.isAvailable(store_type)) {
        context('Sammy.Store', store_type, {
          before: function() {
            this.app = Sammy('#main');
            this.store_attributes = {
              name: 'test_store',
              type: store_type,
              app: this.app
            };
            var store = this.store = new Sammy.Store(this.store_attributes);

            var other_store = this.other_store = new Sammy.Store({
              name: 'other_test_store',
              type: store_type
            });
            stop();
            console.log('stop in before')
            this.store.clearAll(function() {
              other_store.clearAll(function() {
                start();
                console.log('start in before')
              });
            });
          }
        })
        .should('set store type', function() {
          equal(this.store.type, store_type);
        })
        .should('set name', function() {
          equal(this.store.name, 'test_store');
        })
        .should('set the app', function() {
          equal(this.store.app, this.app);
        })
        .should('check if a key exists', function() {
          expect(4);
          console.log('-- stop key exists');
          stop();
          var store = this.store, other_store = this.other_store;
          store.exists('foo', function(foo) {
            ok(!foo);
            store.set('foo', 'bar', function(set) {
              ok(set);
              store.exists('foo', function(after_set) {
                equal(after_set, true);
                other_store.exists('foo', function(foo3) {
                  ok(!foo3);
                console.log('-- start key exists');
          //        start();
                });
              });
            });
          });
        })
        .should('set and retrieve value as string', function() {
          expect(4);
          stop();
          console.log('-- stop value as a string');
          var store = this.store, other_store = this.other_store;
          store.set('foo', 'bar', function(newval, key) {
            equal(key, 'foo');
            equal(newval, 'bar');
            store.get('foo', function(val) {
              equal(val, 'bar');
              other_store.get('foo', function(val) {
                ok(!val);
                console.log(' -- start value as a string')
                start();
              });
            });
          });
        })
        .should('set and retrieve value as JSON', function() {
          var obj = {'obj': 'is json'};
          expect(4);
          stop();
          var store = this.store, other_store = this.other_store;
          store.set('foo', obj, function(newval, key) {
            equal(key, 'foo');
            deepEqual(newval, obj);
            store.get('foo', function(val) {
              deepEqual(val, obj);
              other_store.get('foo', function(val) {
                ok(!val);
                start();
              });
            });
          });
        })
        .should('should store in global space accessible by name', function() {
          expect(1);
          stop();
          var ctx = this;
          this.store.set('foo', 'bar', function() {
            var new_store = new Sammy.Store(ctx.store_attributes);
            new_store.get('foo', function(val) {
              equal(val, 'bar');
              start();
            });
          });
        })
        .should('clear value', function() {
          expect(5);
          stop();
          var store = this.store, other_store = this.other_store;
          store.set('foo', 'bar', function(newval) {
            ok(newval);
            other_store.set('foo', 'bar', function(newval) {
              ok(newval);
              store.get('foo', function(val) {
                equal(val, 'bar');
                store.clear('foo', function() {
                  store.exists('foo', function(foo) {
                    equal(foo, false);
                    other_store.get('foo', function(val) {
                      equal(val, 'bar');
                      start();
                    });
                  });
                });
              });
            });
          });
        })
        .should('fire specific key event on set', function() {
          var fired = false, app = this.app;
          app.bind('set-test_store-foo', function(e, data) {
            fired = data.value;
          });
          app.run();
          expect(1);
          stop();
          this.store.set('foo', 'bar', function() {
            setTimeout(function() {
              equal(fired, 'bar');
              app.unload();
              start();
            }, 1000);
          });
        })
        .should('fire store event on set', function() {
          var fired = false, app = this.app;
          app.bind('set-test_store', function(e, data) {
            fired = data.key;
          });
          app.run();
          expect(1);
          stop();
          this.store.set('foo', 'bar', function() {
            setTimeout(function() {
              equal(fired, 'foo');
              app.unload();
              start();
            }, 900);
          });
        });
      }
    }

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
