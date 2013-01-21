describe('Storage', function() {
  describe('general', function() {
    it('adds the store method to the app', function() {
      var app = new Sammy.Application(function() {
        this.use(Sammy.Storage);
      });

      expect(app.store).to.be.a(Function);
    });

    it('adds the store method to the event contexts', function() {
      var app = new Sammy.Application(function() {
        this.use(Sammy.Storage);
      });
      var context = new app.context_prototype(app, 'get', '#/', {});

      expect(context.store).to.be.a(Function);
    });
  });

  describe('#store()', function() {
    var store, app, context;

    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Storage);
        store = this.store('session');
      });
      context = new app.context_prototype(app, 'get', '#/', {});
      store.clearAll();
    });

    it('creates a new sammy store if it does not exist', function() {
      expect(store.get).to.be.a(Function);
    });

    it('adds a named method shortcut to the app', function() {
      expect(app.session).to.be.a(Function);
    });

    it('adds a named method shortcut to the event contexts', function() {
      expect(context.session).to.be.a(Function);
    });

    it('sets a value if it is passed', function() {
      context.session('foo', 'bar');
      expect(store.get('foo')).to.eql('bar');
    });

    it('gets a value if no value is passed', function() {
      store.set('foo', 'bar');
      expect(context.session('foo')).to.eql('bar');
    });

    it('calls fetch if callback is passed', function() {
      expect(store.get('foo')).to.be(undefined);

      context.session('foo', function() {
        return "bar";
      });

      expect(store.get('foo')).to.eql('bar');
      expect(context.session('foo', function() {
        return 'baz';
      })).to.eql('bar');
    });

    it('adds a clear store helper method', function() {
      expect(context.clearSession).to.be.a(Function);
      context.session('foo', 'bar');
      context.clearSession();
      expect(store.get('foo')).to.be(undefined);
    });
  });

  var stores = ['memory', 'data', 'local', 'session', 'cookie'];
  $.each(stores, function(idx, store_type) {
    if (Sammy.Store.isAvailable(store_type)) {
      describe(store_type, function() {
        var store, store_attributes, other_store;

        beforeEach(function() {
          store_attributes = {
            element: '#main',
            name: 'test_store',
            type: store_type
          };
          store = new Sammy.Store(store_attributes);

          other_store = new Sammy.Store({
            element: '#main',
            name: 'other_test_store',
            type: store_type
          });
          store.clearAll();
          other_store.clearAll();
        });

        it('sets the store type', function() {
          expect(store.type).to.eql(store_type);
        });

        it('sets the name', function() {
          expect(store.name).to.eql('test_store');
        });

        it('sets the element', function() {
          expect(store.element).to.eql('#main');
        });

        it('checks if a key exists', function() {
          expect(store.exists('foo')).to.be(false);
          store.set('foo', 'bar');
          expect(store.exists('foo')).to.be(true);
          expect(other_store.exists('foo')).to.be(false);
        });

        it('sets and retrieves the value as a string', function() {
          store.set('foo', 'bar');
          expect(store.get('foo')).to.eql('bar');
          expect(other_store.get('foo')).to.not.be.ok();
        });

        it('sets and retrieves the value as JSON', function() {
          var obj = {'obj': 'is json'};
          expect(store.set('foo', obj)).to.eql(obj);
          expect(store.get('foo').obj).to.eql('is json');
        });

        it('stores in global space accessible by name', function() {
          store.set('foo', 'bar');
          var new_store = new Sammy.Store(store_attributes);
          expect(new_store.get('foo')).to.eql('bar');
        });

        it('clear the value', function() {
          store.set('foo', 'bar');
          other_store.set('foo', 'bar');
          store.clear('foo');
          expect(store.exists('foo')).to.be(false);
          expect(other_store.exists('foo')).to.be(true);
        });

        it('returns a list of keys', function() {
          store.set('foo', 'bar');
          store.set('blurgh', {boosh: 'blurgh'});
          store.set(123, {boosh: 'blurgh'});
          expect(store.keys()).to.eql(['foo', 'blurgh', '123']);
          expect(other_store.keys()).to.eql([]);
        });

        it('iterates over keys and values', function() {
          var keys = [], values = [];
          store.set('foo', 'bar');
          store.set('blurgh', {boosh: 'blurgh'});
          store.each(function(key, value) {
            keys.push(key);
            values.push(value);
          });
          expect(keys).to.eql(['foo', 'blurgh']);
          expect(values).to.eql(['bar', {boosh: 'blurgh'}]);
        });

        it('clears all values', function() {
          store.set('foo', 'bar');
          store.set('blurgh', {boosh: 'blurgh'});
          store.set(123, {boosh: 'blurgh'});
          expect(store.keys()).to.have.length(3);
          store.clearAll();
          expect(store.keys()).to.have.length(0);
          expect(store.exists('blurgh')).to.be(false);
        });

        it('filters values with a callback', function() {
          store.set('foo', 'bar');
          store.set('blurgh', 'blargh');
          store.set('boosh', 'blargh');
          expect(store.filter(function(key, value) {
            return (value === "blargh");
          })).to.eql([['blurgh', 'blargh'], ['boosh', 'blargh']]);
        });

        it('returns the first value that matches a callback', function() {
          store.set('foo', 'bar');
          store.set('blurgh', 'blargh');
          store.set('boosh', 'blargh');
          expect(store.first(function(key, value) {
            return (value === "blargh");
          })).to.eql(['blurgh', 'blargh']);
        });

        it('fires a specific key event on set', function(done) {
          $('#main').bind('set-test_store-foo', function(e, data) {
            $('#main').unbind('set-test_store-foo');
            expect(data.value).to.eql('bar');
            done();
          });
          store.set('foo', 'bar');
        });

        it('fires store event on set', function(done) {
          $('#main').bind('set-test_store', function(e, data) {
            $('#main').unbind('set-test_store');
            expect(data.key).to.eql('foo');
            done();
          });
          store.set('foo', 'bar');
        });

        it('fetches a value or runs the callback', function() {
          expect(store.get('foo')).to.not.be.ok();

          store.fetch('foo', function() {
            return "bar";
          });

          expect(store.get('foo')).to.eql('bar');
          expect(store.fetch('foo', function() {
            return "baz";
          })).to.eql('bar');
          expect(store.get('foo')).to.eql('bar');
        });

        it('loads a file into a key', function(done) {
          expect(store.get('foo')).to.not.be.ok();
          store.load('foo', 'fixtures/partial', function() {
            expect(store.get('foo')).to.eql('NOENGINE');
            done();
          });
        });
      });
    }
  });
});
