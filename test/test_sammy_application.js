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
          
          this.get(/blurgh/, function() {
            alert('blurgh');
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
    })
    .should('allow shortcuts for defining routes', function() {
      var app = this.a('app');
      ok(app.routes['get']);
      var route = app.routes['get'][2];
      isType(route.path, RegExp);
      equals(route.verb, 'get');
      defined(route, 'callback');
    });
    //
    
    context('Sammy.Application','run', {
      before: function () {
        $('.get_area').html('');
        this.app = new Sammy.Application(function() {
          this.get('#/test', function() {
            $('.get_area').html('test success');
          });
        });
        this.app.run();
      },
      after: function () {
        this.app.unload();
      }
    })
    .should('attach application instance to body', function() {
      isObj(this.a('app'), $.data('body', 'sammy.app'));
    })
    .should_eventually('live bind events to all forms')
    .should('trigger events on URL change', function() {
      window.location = '#/test';
      equals('test success', $('.get_area').html());
    })
    .should_eventually('bind event to clicks as specified by routes')
    
    context('Sammy.Application','lookupRoute', {
      before: function() {
        this.app = new Sammy.Application(function() {
          this.route('get', /\/blah\/(.+)/, function() {
            $('#main').trigger('click');
          });

          this.route('post', '/blah', function() {
            $('#testarea').show();
          });
        });
      }
    })
    .should('find a route by verb and route', function() {
      var app = this.a('app');
      var route = app.lookupRoute('post','/blah');
      isType(route, Object)
      equals(route.verb, 'post');
      defined(route, 'callback');
    })
    .should('find a route by verb and partial route', function() {
      var app = this.a('app');
      var route = app.lookupRoute('get','/blah/mess');
      isType(route, Object)
      equals(route.verb, 'get');
      defined(route, 'callback');
    })
    .should('raise error when route can not be found', function() {
      var app = this.a('app');
      raised(/404/, function() {
        app.lookupRoute('get','/blurgh');
      });
    })
    .should_eventually('die silently if route is not found and 404s are off')
    
  }

})(jQuery);
