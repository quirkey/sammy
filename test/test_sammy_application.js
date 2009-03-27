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
    .should_eventually('throw error if parameters are not correct', function() {
      var app = this.a('app');
      raised(/route/, function () {
        app.route('get', function() {});
      });
    })		
    .should_eventually('turn a string path into a regular expression', function() {
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
    
    context('Sammy.Application','run', {
    
    })
    .should_eventually('attach application instance to body')
    .should_eventually('live bind events to all forms')
    .should_eventually('bind event to URL change')
    .should_eventually('bind event to clicks as specified by routes')
    
    context('Sammy.Application','lookup_route', {
      
    })
    .should_eventually('find a route by verb and route')
    .should_eventually('find a route by verb and partial route')
    .should_eventually('raise error when route can not be found')
    .should_eventually('die silently if route is not found and 404s are off')
    
  }

})(jQuery);
