(function($) {
  with(QUnit) {

    context('Sammy', 'DefaultLocationProxy', {
      before: function() {
        this.app = new Sammy.Application(function() {});
        this.proxy = this.app._location_proxy;
        this.has_native = ('onhashchange' in window);
        this.has_history = window.history && history.pushState;
      }
    })
    .should('store a pointer to the app', function() {
      equal(this.proxy.app, this.app)
    })
    .should('set is_native true if onhashchange exists in window', function(e, spec) {
      if (this.has_native) {
        window.location.hash = '';
        var proxy = new Sammy.DefaultLocationProxy(this.app)
        proxy.bind();
        window.location.hash = '#/testing';
        soon(function() {
          ok(proxy.is_native, "Has native hash change");
          proxy.unbind();
        }, this, 3, 1);
      } else {
        ok(true);
        spec.pending('No native hash change support.')
      }
    })
    .should('set is_native to false if onhashchange does not exist in window', function(e, spec) {
      if (!this.has_native) {
        var proxy = new Sammy.DefaultLocationProxy(this.app)
        proxy.bind();
        window.location.hash = '#/testing'
        soon(function() {
          ok(!proxy.is_native, "does not have native hash change");
          window.location.hash = '';
          proxy.unbind();
        }, this, 3, 1);
        window.location.hash = '';
      } else {
        ok(true);
        spec.pending('Has native hash change support.')
      }
    })
    .should('create poller on hash change', function(e, spec) {
      if (!this.has_native) {
        ok(Sammy.DefaultLocationProxy._interval);
        isType(Sammy.DefaultLocationProxy._interval, 'Number');
      } else {
        ok(true);
        spec.pending('Has native hash change support.')
      }
    })
    .should('only create a single poller', function(e, spec) {
      if (!this.has_native) {
        var interval = Sammy.DefaultLocationProxy._interval;
        var proxy = new Sammy.DefaultLocationProxy(this.app)
        equal(Sammy.DefaultLocationProxy._interval, interval);
      } else {
        ok(true);
        spec.pending('Has native hash change support.')
      }
    })
    .should('return full path for location', function() {
      equal(this.proxy.getLocation(), [window.location.pathname, window.location.search, window.location.hash].join(''));
    })
    .should('push and pop state if History is available', function(t, spec) {
      if (this.has_history) {
        var locations = [], app = this.app, proxy = this.proxy;
        app.bind('location-changed', function(e) {
          locations.push(this.app.getLocation());
        });
        app.run('');
        ok(app.isRunning());
        var original_location = this.proxy.getLocation();
        app.setLocation('/testing');
        expect(6);
        stop();
        setTimeout(function() {
          equal(proxy.getLocation(), '/testing');
          app.setLocation(original_location);
          equal(proxy.getLocation(), original_location);
          setTimeout(function() {
            equal(locations.length, 2);
            equal(locations[0], '/testing');
            equal(locations[1], original_location);
            app.unload();
            start();
          }, 1000);
        }, 1000);
      } else {
        ok(true);
        spec.pending('Browser does not have HTML5 history');
      }
    })
    .should('bind to push state links', function(e, spec) {
      if (this.has_history) {
        var locations = [], app = this.app, proxy = this.proxy;
        app.get('/push', function(e) {
          locations.push(this.app.getLocation());
        });
        app.get('/', function(e) {
          locations.push(this.app.getLocation());
        });
        app.run('');
        ok(app.isRunning());
        var original_location = this.proxy.getLocation();
        $('#push').click();
        expect(6);
        stop();
        setTimeout(function() {
          equal(proxy.getLocation(), '/push');
          $('#pop').click();
          equal(proxy.getLocation(), '/');
          proxy.setLocation(original_location)
          setTimeout(function() {
            equal(locations.length, 2);
            equal(locations[0], '/push');
            equal(locations[1], '/');
            app.unload();
            start();
          }, 1000);
        }, 1000);
      } else {
        ok(true);
        spec.pending('Browser does not have HTML5 history');
      }
    })
    .should('handle arbitrary non-specific locations', function(e) {
      var app = this.app, proxy = this.proxy, has_history = this.has_history;
      var triggered = false, locations = [];
      app.get('/testing', function(e) {
        triggered = true;
        locations.push(this.app.getLocation());
      });
      app.get('/', function(e) {
        triggered = true;
        locations.push(this.app.getLocation());
      });
      app.run();
      ok(app.isRunning());
      var original_location = proxy.getLocation();
      expect(5);
      stop();
      proxy.setLocation('testing');
      setTimeout(function() {
        if (has_history) {
          equal(proxy.getLocation(), '/testing');
        } else {
          equal(proxy.getLocation(), '/#!/testing');
        }
        proxy.setLocation('');
        equal(proxy.getLocation(), '/');
        proxy.setLocation(original_location)
        setTimeout(function() {
          matches(/testing/, locations[0]);
          matches(/\//, locations[1]);
          app.unload();
          start();
        }, 1000);
      }, 1000);
    });


    context('Sammy', 'DataLocationProxy', {
      before: function() {
        this.app = new Sammy.Application(function() {
          this.setLocationProxy(new Sammy.DataLocationProxy(this));
        });
      }
    })
    .should('store a pointer to the app', function() {
      equal(this.app._location_proxy.app, this.app);
    })
    .should('be able to configure data name', function() {
      var proxy = new Sammy.DataLocationProxy(this.app, 'othername');
      proxy.setLocation('newlocation');
      equal($('body').data('othername'), 'newlocation');
    })
    .should('trigger app event when data changes', function() {
      $('body').data(this.app._location_proxy.data_name, '');
      var triggered = false,
          location = false,
          app = this.app;
      app.bind('location-changed', function() {
        triggered = true;
        location = this.app.getLocation();
      });
      ok(!triggered);
      app.run('#/');
      $('body').data(this.app._location_proxy.data_name, '#/newhash');
      soon(function() {
        ok(triggered);
        equal(location, '#/newhash');
        app.unload();
      }, this, 2, 3);
    })
    .should('return the current location from data', function() {
      $('body').data(this.app._location_proxy.data_name, '#/zuh')
      equal(this.app._location_proxy.getLocation(), '#/zuh');
    })
    .should('set the current location in data', function() {
      $('body').data(this.app._location_proxy.data_name, '#/zuh')
      equal(this.app._location_proxy.getLocation(), '#/zuh');
      this.app._location_proxy.setLocation('#/boosh');
      equal('#/boosh', this.app._location_proxy.getLocation());
    })
    .should('return an empty string when there is no location stored in data', function() {
      $.removeData($('body')[0], this.app._location_proxy.data_name);
      equal(null, $('body').data(this.app._location_proxy.data_name));
      equal('', this.app._location_proxy.getLocation());
    });


  }
})(jQuery);
