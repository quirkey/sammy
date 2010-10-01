(function($) {
  with(QUnit) {

    context('Sammy', 'HashLocationProxy', {
      before: function() {
        this.app = new Sammy.Application;
        this.proxy = new Sammy.HashLocationProxy(this.app);
        this.has_native = ('onhashchange' in window);
      }
    })
    .should('store a pointer to the app', function() {
      equal(this.proxy.app, this.app)
    })
    .should('set is_native true if onhashchange exists in window', function() {
      if (this.has_native) {
        window.location.hash = '';
        var proxy = new Sammy.HashLocationProxy(this.app)
        proxy.bind();
        window.location.hash = '#/testing';
        soon(function() {
          ok(proxy.is_native, "Has native hash change");
          proxy.unbind();
        }, this, 3, 1);
      } else {
        ok(true, 'No native hash change support.')
      }
    })
    .should('set is_native to false if onhashchange does not exist in window', function() {
      if (!this.has_native) {
        var proxy = new Sammy.HashLocationProxy(this.app)
        proxy.bind();
        window.location.hash = '#/testing'
        soon(function() {
          ok(!proxy.is_native, "does not have native hash change");
          window.location.hash = '';
          proxy.unbind();
        }, this, 3, 1);
        window.location.hash = '';
      } else {
        ok(true, 'Native hash change support.')
      }
    })
    .should('create poller on hash change', function() {
      if (!this.has_native) {
        ok(Sammy.HashLocationProxy._interval);
        isType(Sammy.HashLocationProxy._interval, 'Number');
      } else {
        ok(true, 'Native hash change support.')
      }
    })
    .should('only create a single poller', function() {
      if (!this.has_native) {
        var interval = Sammy.HashLocationProxy._interval;
        var proxy = new Sammy.HashLocationProxy(this.app)
        equal(Sammy.HashLocationProxy._interval, interval);
      } else {
        ok(true, 'Native hash change support.')
      }
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
