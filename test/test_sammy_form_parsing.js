(function($) {
  with(jqUnit) {
    context('Sammy.Application', 'parseParams', {
      before: function () {
        this.app = new Sammy.Application(function() {
          this.route('post', /test_nested_params/, function() {
            this.app.form_params = this.params;
            return false;
          });
        });
      }
    })
    .should('parse a twice submitted value', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['author'], 'Thoreau');        
        app.unload();
      }, this, 1, 2);
    })
    .should('parse basic arrays', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['genre'][0], ['documentary']);
        equals(app.form_params['genre'][1], ['nature']);
        app.unload();
      }, this, 1, 3);
    })
    .should('parse basic hashes', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['poll']['name'], 'Which beverage do you like best?');
        equals(app.form_params['poll']['priority'], '10');
        app.unload();
      }, this, 1, 3);      
    })
    .should('parse nested hashes', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['poll']['options']['1']['id'], 'Ko5Pi');
        equals(app.form_params['poll']['options']['1']['name'], 'Coffee');
        equals(app.form_params['poll']['options']['2']['id'], 'Oaj5N');
        equals(app.form_params['poll']['options']['2']['name'], 'Tea');
        app.unload();
      }, this, 1, 5);
    })
    .should('parse arrays in nested hashes', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['poll']['options']['1']['ingredients'][0], 'Water');
        equals(app.form_params['poll']['options']['1']['ingredients'][1], 'Coffein');
        app.unload();
      }, this, 1, 3);
    })
    .should('parse hashes in nested arrays in nested hashes', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['woods']['trees'][0]['name'], 'Spruce');
        equals(app.form_params['woods']['trees'][1]['name'], 'Maple');
        app.unload();
      }, this, 1, 3);            
    })
    .should('parse arrays in nested hashes in nested arrays', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['pages'][0]['words'][0], 'Woods');
        equals(app.form_params['pages'][1]['words'][0], 'Money');
        app.unload();
      }, this, 1, 3);      
    })
    .should('unescape escaped params', function() {
      var app = this.app;
      app.run('#/');
      $('#nested_params_test_form').submit();
      soon(function() {
        ok(app.form_params);
        equals(app.form_params['title'], 'Walden!');
        app.unload();
      }, this, 1, 2);
    });
    
    //    Rack::Utils.parse_nested_query("x[y][][z]=1&x[y][][w]=a&x[y][][z]=2&x[y][][w]=3").
    //      should.equal "x" => {"y" => [{"z" => "1", "w" => "a"}, {"z" => "2", "w" => "3"}]}
  }
})(jQuery);
