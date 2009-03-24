(function($) {

  with(jqUnit) {

    context('Sammy.Application', 'init', {
      before: function() {
        this.app = new Sammy.Application(function() {
          this.random_setting = 1;
        });
      }
    })
    .should('create a sammy object', function() {
      defined(this.a('app'), 'route');
    })
    .should('set arbitrary settings in the app', function() {
      equals(this.a('app').random_setting, 1);
    })
    .should('initialize empty routes object', function() {
      isType(this.a('app').routes, Object);
    });


    context('Sammy.Application', 'route', {
      before: function() {
        this.app = new Sammy.Application(function() {
          this.route('get', /test/, function() {
            $('#main').trigger('click');
          });

          this.route('get', '/blah', function() {
            $('#testarea').show();
          });
        });
      }
    })
    .should('throw error if parameters are not correct', function() {
      var app = this.a('app');
      raised(/route/, function () {
        app.route('get', function() {});
      });
    })		
    .should('turn a string path into a regular expression', function() {
      var app = this.a('app');
      ok(app.routes['get']);
      var route = app.routes['get'][1];
      isType(route.path, RegExp);
    })
    .should('append route to application.routes object', function() {
      var app = this.a('app');
      ok(app.routes['get']);
      var route = app.routes['get'][0]
      isType(route.path, RegExp);
      equals(route.verb, 'get');
      defined(route, 'callback');
    });
    //
  }

})(jQuery);
