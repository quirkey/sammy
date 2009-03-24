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
        this.app = Sammy.Application(function() {

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
      try {
        app.route('get', function() {});
      } catch(e) {
        match(/route/,e.message);
      }
    })		
    .should('turn a string path into a regular expression', function() {
      var app = this.a('app');
      isType(app.routes['get'][1], Object);
    })
    .should('append route to application.routes object', function() {
      var app = this.a('app');
      ok(app.routes['get'])
      isType(app.routes['get'][0], Object);
    });
    // 

  }

})(jQuery);
