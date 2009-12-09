(function($) {
    with(jqUnit) {
      context('Sammy.Cache', 'cache', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.Cache, 'memory');
             this.cache('mycache', 'my value');
             this.cache('mynumcache', 3);
           });
           this.other_app = new Sammy.Application(function() {
             this.use(Sammy.Cache, 'data');
             this.cache('mycache', 'not my value');
             this.cache('mynumcache', 7);
           });
         }
       })
       .should('retrieve values by passing name', function() {
         equals(this.app.cache('mycache'), 'my value');
         equals(this.other_app.cache('mycache'), 'not my value');
         equals(this.app.cache('mynumcache'), 3);
         equals(this.other_app.cache('mynumcache'), 7);
       })
       .should('set values by passing value', function() {
         this.app.cache('mycache', 'my new value');
         equals(this.app.cache('mycache'), 'my new value');
       })
       .should('run callback only if value is not set', function() {
         var context = null;
         var run     = false;
         this.app.cache('mycache', function() {
           run = true;
           context = this;
           return 'new value';
         });
         equals(run, false);
         equals(context, null);
         this.app.cache('mynewcache', function() {
           run = true;
           context = this;
           return 'new value';
         });
         equals(run, true);
         equals(context, this.app);
         equals(this.app.cache('mynewcache'), 'new value');
       })
       .should('clear specific cache value', function() {
         this.app.clearCache('mycache');
         equals(typeof this.app.cache('mycache'), 'undefined')
       });
       
      
       context('Sammy', 'Template', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.Template);
           });
           this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
           
           this.alias_app = new Sammy.Application(function() {
             this.use(Sammy.Template, 'tpl');
           });
           this.alias_context = new this.alias_app.context_prototype(this.alias_app, 'get', '#/', {});
         }
       })
       .should('add template helper to event context', function() {
         ok($.isFunction(this.context.template));
       })
       .should('interpolate content', function() {
         var rendered = this.context.template('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
         equals(rendered, '<div class="test_class">TEXT!</div>');
       })
       .should('set the context of the template to the test_context', function() {
         this.context.blurgh = 'boosh';
         var rendered = this.context.template('<div class="test_class"><%= text %> <%= blurgh %></div>', {text: 'TEXT!'});
         equals(rendered, '<div class="test_class">TEXT! boosh</div>');
       })
       .should('render templates with a lot of single quotes', function() {
         var rendered = this.context.template("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
         equals(rendered, "<div class='test_class' id='test'>I'm TEXT!</div>");
       })
       .should('alias the template method and thus the extension', function() {
         ok(!$.isFunction(this.alias_context.template));
         ok($.isFunction(this.alias_context.tpl));
         ok(this.alias_context.tpl.toString().match(/srender/));
       });
    
    
       context('Sammy.NestedParams', 'parsing', {
         before: function () {
           this.app = new Sammy.Application(function() {
             this.element_selector = '#form_params';
             this.use(Sammy.NestedParams);
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
       .should('parse complex hashes in nested arrays in nested hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equals(app.form_params['music']['instruments'][0]['name'], 'Piano');
           equals(app.form_params['music']['instruments'][0]['size'], 'big');
           equals(app.form_params['music']['instruments'][1]['name'], 'Flute');
           equals(app.form_params['music']['instruments'][1]['size'], 'small');
           app.unload();
         }, this, 1, 5);
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
       
       context('Sammy.NestedParams', 'bad fields', {
         before: function () {
           this.app = new Sammy.Application(function() {
             this.element_selector = '#form_params';
             this.use(Sammy.NestedParams);
           });
         }
       }).should('raise error for bad params', function() {
         var app = this.app;
         raised(/400/, function() {
           app._parseFormParams($('#bad_nested_params_form'));
         });
       });
      
    };
})(jQuery);