(function($) {
  with(jqUnit) {
    
    context('Sammy', 'HashLocationProxy', {
      before: function() {
        this.app = new Sammy.Application;
        this.proxy = new Sammy.HashLocationProxy(this.app);
        this.has_native = (typeof window.onhashchange != 'undefined');
      }
    })
    .should('store a pointer to the app', function() {
      equals(this.proxy.app, this.app)
    })
    .should('set is_native true if onhashchange exists in window', function() {
      if (this.has_native) {
        var proxy = new Sammy.HashLocationProxy(this.app)
        ok(proxy.is_native)
      } else {
        ok(true, 'No native hash change support.')
      }
    })
    .should('set is_native to false if onhashchange does not exist in window', function() {
      if (!this.has_native) {
        var proxy = new Sammy.HashLocationProxy(this.app)
        ok(!proxy.is_native)
      } else {
        ok(true, 'Native hash change support.')
      }
    })
    .should('create poller on hash change', function() {
      if (!this.has_native) {
        ok(Sammy.HashLocationProxy._interval);
        isType(Sammy.HashLocationProxy._interval, Number);
      } else {
        ok(true, 'Native hash change support.')
      }
    })
    .should('only create a single poller', function() {
      if (!this.has_native) {
        var interval = Sammy.HashLocationProxy._interval;
        var proxy = new Sammy.HashLocationProxy(this.app)
        equals(Sammy.HashLocationProxy._interval, interval);
      } else {
        ok(true, 'Native hash change support.')
      }
    })
    .should('trigger app event when hash changes', function() {
      window.location.hash = '';
      var triggered = false, app = this.app;
      app.bind('location-changed', function() {
        Sammy.log('app location changed');
        triggered = true;
      });
      ok(!triggered);
      app.run('#/');
      Sammy.log('changing location to #/newhash');
      window.location.hash = '/newhash';
      soon(function() {
        ok(triggered);
        app.unload();
      }, this, 2, 2);
    })
    .should('return the current location', function() {
      window.location = '#/zuh'
      equals(this.proxy.getLocation(), '#/zuh');
    })
    .should('set the current location', function() {
      window.location = '#/zuh'
      equals(this.proxy.getLocation(), '#/zuh');
      this.proxy.setLocation('#/boosh');
      equals('#/boosh', this.proxy.getLocation());
    });
    
    
    context('Sammy', 'DataLocationProxy', {
      
    });

  }
})(jQuery);