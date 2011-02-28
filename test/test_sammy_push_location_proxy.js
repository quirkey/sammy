(function($) {
  with(QUnit) {

    context('Sammy.PushLocationProxy', 'app.pushlocation', {
      before: function() {
        this.app = new Sammy.Application;
        this.proxy = new Sammy.PushLocationProxy(this.app);
        this.app.setLocationProxy(new Sammy.PushLocationProxy(this.app));
      }
    })
    .should('store a pointer to the app', function() {
      equal(this.proxy.app, this.app)
    })
    .should('trigger app on location change', function() {
      this.app.run();
      $('#push').click();
      equal('/push', this.app._location_proxy.getLocation());
      $('#pop').click();
      equal('/', this.app._location_proxy.getLocation());
    });

  }
})(jQuery);
