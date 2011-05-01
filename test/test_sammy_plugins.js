(function($) {
    with(QUnit) {
      context('Sammy.Cache', 'cache', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.Cache);
             this.clearCache();
             this.cache('mycache', 'my value');
             this.cache('mynumcache', 3);
           });
           this.other_app = new Sammy.Application(function() {
             this.element_selector = '#main';
             this.use(Sammy.Cache);
             this.clearCache();
             this.cache('mycache', 'not my value');
             this.cache('mynumcache', 7);
           });
         }
       })
       .should('retrieve values by passing name', function() {
         equal(this.app.cache('mycache'), 'my value');
         equal(this.other_app.cache('mycache'), 'not my value');
         equal(this.app.cache('mynumcache'), 3);
         equal(this.other_app.cache('mynumcache'), 7);
       })
       .should('set values by passing value', function() {
         this.app.cache('mycache', 'my new value');
         equal(this.app.cache('mycache'), 'my new value');
       })
       .should('run callback only if value is not set', function() {
         var inner_context = null;
         var was_run     = false;
         this.app.cache('mycache', function() {
           was_run = true;
           return 'new value';
         });
         equal(was_run, false);
         equal(inner_context, null);
         this.app.cache('mynewcache', function() {
           was_run = true;
           inner_context = this;
           return 'new value';
         });
         equal(was_run, true);
         deepEqual(inner_context, this.app.store('cache'), "The inner context should equal the store");
         equal(this.app.cache('mynewcache'), 'new value', "Should set the new value");
       })
       .should('clear specific cache value', function() {
         this.app.store('cache').clear('mycache');
         ok(!this.app.cache('mycache'))
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
         equal(rendered, '<div class="test_class">TEXT!</div>');
       })
       .should('set the context of the template to the test_context', function() {
         this.context.blurgh = 'boosh';
         var rendered = this.context.template('<div class="test_class"><%= text %> <%= blurgh %></div>', {text: 'TEXT!'});
         equal(rendered, '<div class="test_class">TEXT! boosh</div>');
       })
       .should('render templates with a lot of single quotes', function() {
         var rendered = this.context.template("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
         equal(rendered, "<div class='test_class' id='test'>I'm TEXT!</div>");
       })
       .should('alias the template method and thus the extension', function() {
         ok(!$.isFunction(this.alias_context.template));
         ok($.isFunction(this.alias_context.tpl));
         ok(this.alias_context.tpl.toString().match(/srender/));
       });

      context('Sammy', 'EJS', {
         before: function() {
           this.app = new Sammy.Application(function() {
             this.use(Sammy.EJS);
           });
           this.context = new this.app.context_prototype(this.app, 'get', '#/', {});

           this.alias_app = new Sammy.Application(function() {
             this.use(Sammy.EJS, 'ejs');
           });
           this.alias_context = new this.alias_app.context_prototype(this.alias_app, 'get', '#/', {});
         }
       })
       .should('add template helper to event context', function() {
         ok($.isFunction(this.context.ejs));
       })
       .should('interpolate content', function() {
         var rendered = this.context.ejs('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
         equal(rendered, '<div class="test_class">TEXT!</div>');
       })
       .should('render templates with a lot of single quotes', function() {
         var rendered = this.context.ejs("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
         equal(rendered, "<div class='test_class' id='test'>I'm TEXT!</div>");
       })
       .should('alias the template method and thus the extension', function() {
         ok(!$.isFunction(this.alias_context.template));
         ok($.isFunction(this.alias_context.ejs));
         ok(this.alias_context.ejs.toString().match(/render/));
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
           equal(app.form_params['author'], 'Thoreau', 'takes the last value');
           app.unload();
         }, this, 1, 2);
       })
       .should('parse true and false values as true and false literals', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['falsevalue'], false);
           equal(app.form_params['truevalue'], true);
           app.unload();
         }, this, 1, 3);
       })
       .should('parse basic arrays', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['genre'][0], ['documentary']);
           equal(app.form_params['genre'][1], ['nature']);
           app.unload();
         }, this, 1, 3);
       })
       .should('parse basic hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['poll']['name'], 'Which beverage do you like best?');
           equal(app.form_params['poll']['priority'], '10');
           app.unload();
         }, this, 1, 3);
       })
       .should('parse nested hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['poll']['options']['1']['id'], 'Ko5Pi');
           equal(app.form_params['poll']['options']['1']['name'], 'Coffee');
           equal(app.form_params['poll']['options']['2']['id'], 'Oaj5N');
           equal(app.form_params['poll']['options']['2']['name'], 'Tea');
           app.unload();
         }, this, 1, 5);
       })
       .should('parse arrays in nested hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['poll']['options']['1']['ingredients'][0], 'Water');
           equal(app.form_params['poll']['options']['1']['ingredients'][1], 'Coffein');
           app.unload();
         }, this, 1, 3);
       })
       .should('parse hashes in nested arrays in nested hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['woods']['trees'][0]['name'], 'Spruce');
           equal(app.form_params['woods']['trees'][1]['name'], 'Maple');
           app.unload();
         }, this, 1, 3);
       })
       .should('parse arrays in nested hashes in nested arrays', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['pages'][0]['words'][0], 'Woods');
           equal(app.form_params['pages'][1]['words'][0], 'Money');
           app.unload();
         }, this, 1, 3);
       })
       .should('parse complex hashes in nested arrays in nested hashes', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['music']['instruments'][0]['name'], 'Piano');
           equal(app.form_params['music']['instruments'][0]['size'], 'big');
           equal(app.form_params['music']['instruments'][1]['name'], 'Flute');
           equal(app.form_params['music']['instruments'][1]['size'], 'small');
           app.unload();
         }, this, 1, 5);
       })
       .should('unescape escaped params', function() {
         var app = this.app;
         app.run('#/');
         $('#nested_params_test_form').submit();
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['title'], 'Walden!');
           app.unload();
         }, this, 1, 2);
       })
       .should('parse the query string', function() {
         var app = this.app;
         app.get('#/get_form', function() {
           app.form_params = this.params;
         });

         app.run('#/');
         window.location.href = '#/get_form?genre%5B%5D=documentary&genre%5B%5D=nature'
         soon(function() {
           ok(app.form_params);
           equal(app.form_params['genre'][0], ['documentary']);
           equal(app.form_params['genre'][1], ['nature']);
           app.unload();
         }, this, 1, 3);
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

       // Pretty much a copy of the Template tests
       context('Sammy', 'Mustache', {
          before: function() {
            this.app = new Sammy.Application(function() {
              this.use(Sammy.Mustache);
            });
            this.context = new this.app.context_prototype(this.app, 'get', '#/', {});

            this.alias_app = new Sammy.Application(function() {
              this.use(Sammy.Mustache, 'ms');
            });
            this.alias_context = new this.alias_app.context_prototype(this.alias_app, 'get', '#/', {});
          }
        })
        .should('add mustache helper to event context', function() {
          ok($.isFunction(this.context.mustache));
        })
        .should('interpolate content', function() {
          var rendered = this.context.mustache('<div class="test_class">{{text}}</div>', {text: 'TEXT!'});
          equal(rendered, '<div class="test_class">TEXT!</div>');
        })
        .should('set the context of the template to the test_context', function() {
          this.context.blurgh = 'boosh';
          var rendered = this.context.mustache('<div class="test_class">{{text}} {{blurgh}}</div>', {text: 'TEXT!'});
          equal(rendered, '<div class="test_class">TEXT! boosh</div>');
        })
        .should('allow mustache partials by passing partials to data', function() {
          var data = {blurgh: 'boosh', partials: {first: 'a {{what}}'}, first: {what: 'partial'}};
          var rendered = this.context.mustache('<div class="test_class">{{>first}} {{blurgh}}</div>', data);
          equal(rendered, '<div class="test_class">a partial boosh</div>');
        })
        .should('alias the mustache method and thus the extension', function() {
          ok(!$.isFunction(this.alias_context.mustache));
          ok($.isFunction(this.alias_context.ms));
          ok(this.alias_context.ms.toString().match(/Mustache/));
        });

        // Pretty much a copy of the Mustache tests
        context('Sammy', 'Handlebars', {
          before: function() {
            this.app = new Sammy.Application(function() {
              this.use(Sammy.Handlebars);
            });
            this.context = new this.app.context_prototype(this.app, 'get', '#/', {});

            this.alias_app = new Sammy.Application(function() {
              this.use(Sammy.Handlebars, 'hb');
            });
            this.alias_context = new this.alias_app.context_prototype(this.alias_app, 'get', '#/', {});
          }
        })
        .should('add handlebars helper to event context', function() {
          ok($.isFunction(this.context.handlebars));
        })
        .should('interpolate content', function() {
          var rendered = this.context.handlebars('<div class="test_class">{{text}}</div>', {text: 'TEXT!'});
          equal(rendered, '<div class="test_class">TEXT!</div>');
        })
        .should('set the context of the template to the test_context', function() {
          this.context.blurgh = 'boosh';
          var rendered = this.context.handlebars('<div class="test_class">{{text}} {{blurgh}}</div>', {text: 'TEXT!'});
          equal(rendered, '<div class="test_class">TEXT! boosh</div>');
        })
        .should('allow handlebars partials by passing partials to data', function() {
          var data = {blurgh: 'boosh', partials: {first: 'a {{what}}'}, what: 'partial'};
          var rendered = this.context.handlebars('<div class="test_class">{{>first}} {{blurgh}}</div>', data);
          equal(rendered, '<div class="test_class">a partial boosh</div>');
        })
        .should('alias the handlebars method and thus the extension', function() {
          ok(!$.isFunction(this.alias_context.handlebars));
          ok($.isFunction(this.alias_context.hb));
          ok(this.alias_context.hb.toString().match(/Handlebars/));
        });

        // Pretty much a copy of the Mustache tests
        context('Sammy', 'jQuery-tmpl', {
          before: function() {
            this.app = new Sammy.Application(function() {
              this.use(Sammy.Tmpl);
            });
            this.context = new this.app.context_prototype(this.app, 'get', '#/', {});

            this.alias_app = new Sammy.Application(function() {
              this.use(Sammy.Tmpl, 'jqt');
            });
            this.alias_context = new this.alias_app.context_prototype(this.alias_app, 'get', '#/', {});
          }
        })
        .should('add tmpl helper to event context', function() {
          ok($.isFunction(this.context.tmpl));
        })
        .should('interpolate content', function() {
          var rendered = this.context.tmpl('<div class="test_class">${text}</div>', {text: 'TEXT!'});
          sameHTML(rendered, '<div class="test_class">TEXT!</div>');
        })
        .should('set the context of the template to the test_context', function() {
          this.context.blurgh = 'boosh';
          var rendered = this.context.tmpl('<div class="test_class">${text} ${blurgh}</div>', {text: 'TEXT!'});
          sameHTML(rendered, '<div class="test_class">TEXT! boosh</div>');
        })
//        .should('allow tmpl partials by passing partials to data', function() {
//          var data = {blurgh: 'fizzzz', partials: {first: 'a ${what}'}, what: 'partial'};
//          var rendered = this.context.tmpl('<div class="test_class">{{tmpl partials.first}} ${blurgh}</div>', data);
//          sameHTML(rendered, '<div class="test_class">a partial boosh</div>');
//        })
        .should('alias the tmpl method and thus the extension', function() {
          ok(!$.isFunction(this.alias_context.tmpl));
          ok($.isFunction(this.alias_context.jqt));
          ok(this.alias_context.jqt.toString().match(/jQuery\.tmpl/));
        });

      context('Sammy', 'JSON', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.JSON);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('add json helper to event context', function() {
        ok($.isFunction(this.context.json));
      })
      .should('ensure JSON is in the global namespace', function() {
        ok($.isFunction(JSON.parse));
        ok($.isFunction(JSON.stringify));
      })
      .should('parse JSON if object is a string', function() {
        equal(this.context.json("{\"test\":\"123\"}").test, "123");
      })
      .should('stringify JSON if object is an object', function() {
        equal(this.context.json({test: "123"}),"{\"test\":\"123\"}");
      });


      context('Sammy', 'Haml', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Haml);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('add haml helper to context', function() {
        ok($.isFunction(this.context.haml));
      })
      .should('use haml-js to render haml templates', function() {
        var template = ".mytemplate= title";
        sameHTML(this.context.haml(template, {title: "HAML!!"}), "<div class=\"mytemplate\">HAML!!</div>");
      });

      context('Sammy', 'Pure', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Pure);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
        }
      })
      .should('add pure helper to context', function() {
        ok($.isFunction(this.context.pure));
      })
      .should('use pure to render templates', function() {
        var template = "<div class='title'></div>";
        sameHTML(this.context.pure(template, {title: "PURE!!"}), "<div class=\"title\">PURE!!</div>");
      });

      context('Sammy', 'Form', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Form);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
          this.item = {
            name: 'Test Item'
          };
        }
      })
      .should("return simple string element with simple_element", function() {
        equal(this.context.simple_element('div', {'class': 'test'}, "test"), "<div class='test'>test</div>");
      })
      .should("create self closing if no content is passed", function() {
        equal(this.context.simple_element('div', {'class': 'test'}), "<div class='test' />");
      })
      .should("evaluate attributes that are functions", function() {
        equal(this.context.simple_element('div', {id: function() { return 'test'; }}), "<div id='test' />");
      });

      context('Sammy', 'Form', 'FormBuilder', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Form);
            this.use(Sammy.Template);
          });
          this.context = new this.app.context_prototype(this.app, 'get', '#/', {});

          // test item
          this.item = {
            id: "1234",
            name: 'Item Name',
            price: '$10.00',
            quantity: 5,
            description: "This is a long\ndescription",
            color: function() {
              return 'red';
            },
            meta: {
              url: 'http://www.quirkey.com'
            },
            is_private: false,
            related: [
              {name: 'Related 1'},
              {name: 'Related 2'}
            ]
          };
          this.builder = new Sammy.FormBuilder('item', this.item);
        }
      })
      .should("create form builder with name and object", function() {
        ok(this.builder);
        equal(this.builder.name, 'item');
        deepEqual(this.builder.object, this.item);
      })
      .should("return text field for attribute with simple keypath", function() {
        equal(this.builder.text('name'), "<input type='text' name='item[name]' value='Item Name' class='item-name' />")
      })
      .should("return text field with additional attributes", function() {
        equal(this.builder.text('name', {rel: 'test'}), "<input type='text' name='item[name]' value='Item Name' class='item-name' rel='test' />")
      })
      .should("return text field when the attribute doesnt exist", function() {
        equal(this.builder.text('none'), "<input type='text' name='item[none]' value='' class='item-none' />")
      })
      .should("return text field for an attribute with a deep keypath", function() {
        equal(this.builder.text('meta.url'), "<input type='text' name='item[meta][url]' value='http://www.quirkey.com' class='item-meta-url' />")
        equal(this.builder.text(['meta', 'url']), "<input type='text' name='item[meta][url]' value='http://www.quirkey.com' class='item-meta-url' />")
      })
      .should("return text field for an attribute with an array keypath", function() {
        equal(this.builder.text('related.0.name'), "<input type='text' name='item[related][0][name]' value='Related 1' class='item-related-0-name' />")
      })
      .should("return a select tag with options and selection", function() {
        equal(this.builder.select('color', ['blue', 'red', 'green']), "<select name='item[color]' class='item-color'><option value='blue'>blue</option><option value='red' selected='selected'>red</option><option value='green'>green</option></select>")
      })
      .should("return a label with key as for", function() {
        equal(this.builder.label('name', 'Name'), "<label for='item[name]'>Name</label>");
      })
      .should("return a hidden input", function() {
        equal(this.builder.hidden('id'), "<input type='hidden' name='item[id]' value='1234' class='item-id' />");
      })
      .should("return a textarea", function() {
        equal(this.builder.textarea('description'), "<textarea name='item[description]' class='item-description'>This is a long\ndescription</textarea>");
      })
      .should("return a checkbox", function() {
        equal(this.builder.checkbox('is_private', true), "<input type='hidden' name='item[is_private]' value='false' class='item-is_private' /><input type='checkbox' name='item[is_private]' value='true' class='item-is_private' />");
        this.item.is_private = true;
        equal(this.builder.checkbox('is_private', true), "<input type='hidden' name='item[is_private]' value='false' class='item-is_private' /><input type='checkbox' name='item[is_private]' value='true' class='item-is_private' checked='checked' />")
      })
       .should("return a checkbox with no hidden element", function() {
          equal(this.builder.checkbox('is_private', true, {hidden_element: false}), "<input type='checkbox' name='item[is_private]' value='true' class='item-is_private' />");
          this.item.is_private = true;
          equal(this.builder.checkbox('is_private', true, {hidden_element: false}), "<input type='checkbox' name='item[is_private]' value='true' class='item-is_private' checked='checked' />")
        })
      .should("return a radio button", function() {
        equal(this.builder.radio('quantity', 5), "<input type='radio' name='item[quantity]' value='5' class='item-quantity' checked='checked' />");
      })
      .should("build a form with form in a template", function() {
        var template = "<% formFor('item', function(f) { %>" +
                       "<%= f.open() %>" +
                       "<p><label>Name:</label><%= f.text('name') %></p>" +
                       "<%= f.close() %>" +
                       "<% }); %>";
        var rendered = "<form method='post' action='#/items'><p><label>Name:</label><input type='text' name='item[name]' value='Item Name' class='item-name' /></p></form>"
        this.context.item = this.item;
        equals(this.context.template(template, {}, {escape_html: false}), rendered);
      });

      context('Sammy', 'OAuth 2.0', {
        before: function() {
          window.location.hash = '';
          this.app = new Sammy.Application(function() {
            this.use(Sammy.Session);
            this.use(Sammy.OAuth2);
            this.loseAccessToken(); // Clear from previous run
            this.authorize = '#/oauth/authorize-me';
            this.requireOAuth();
            this.get('#/private', function(context) {
              context.app.requested = true;
            });
            this.get('#/signout', function(context) {
              context.loseAccessToken();
            });
            this.bind('oauth.denied', function(evt, error) {
              this.app.denied = error;
            });
          });
        }
      })
      .should("request authorization if there is no token", function() {
         this.app.run('#/');
         window.location.href = '#/private';
         soon(function() {
           equal(location.hash, '#/oauth/authorize-me?state=/%23/private');
           ok(!this.app.requested);
           this.app.unload();
         }, this, 1, 2);
      })
      .should("capture access token from successful authorization", function() {
         this.app.run('#/');
         window.location.href = '#access_token=5678&state=%23';
         soon(function() {
           equal(this.app.getAccessToken(), '5678');
           this.app.unload();
         }, this, 1, 1);
      })
      .should("should redirect to original URL after successful authorization", function() {
         this.app.run('#/');
         window.location.href = '#state=%23/private&access_token=5678';
         soon(function() {
           ok(location.hash, '#/private');
           this.app.unload();
         }, this, 1, 1);
      })
      .should("trigger oauth.error event if authorization denied", function() {
         this.app.run('#/');
         window.location.href = '#error=access_denied&error_description=Access+Denied';
         soon(function() {
           equal(this.app.denied.code, 'access_denied');
           equal(this.app.denied.message, "Access Denied");
           this.app.unload();
         }, this, 1, 2);
      })
      .should("lose access token from helper method", function() {
         this.app.run('#/');
         this.app.setAccessToken('5678');
         equal(this.app.getAccessToken(), '5678');
         window.location.href = '#/signout';
         soon(function() {
           equal(this.app.getAccessToken(), null);
           this.app.unload();
         }, this, 1, 2);
      })
      .should("pass to route if token available", function() {
         this.app.run('#/');
         this.app.setAccessToken('5678');
         window.location.href = '#/private';
         soon(function() {
           equal(location.hash, '#/private');
           ok(this.app.requested);
           this.app.unload();
         }, this, 1, 2);
      })
      .should("trigger oauth.connected when connected", function() {
        var connected;
        this.app.bind('oauth.connected', function() { connected = true });
        this.app.run('#/');
        window.location.href = '#access_token=5678&state=%23';
        soon(function() {
          ok(connected);
          this.app.unload();
        }, this, 1, 1);
      })
      .should("trigger oauth.connected if started with access token", function() {
        var connected;
        this.app.bind('oauth.connected', function() { connected = true });
        this.app.setAccessToken('5678');
        this.app.run('#/');
        soon(function() {
          ok(connected);
          this.app.unload();
        }, this, 1, 1);
      })
      .should("not trigger oauth.connected if started without access token", function() {
        var connected;
        this.app.bind('oauth.connected', function() { connected = true });
        this.app.run('#/');
        soon(function() {
          ok(!connected);
          this.app.unload();
        }, this, 1, 1);
      })
      .should("trigger oauth.disconnected if access token lost", function() {
        var disconnected;
        this.app.bind('oauth.disconnected', function() { disconnected = true });
        this.app.setAccessToken('5678');
        this.app.run('#/');
        window.location.href = '#/signout';
        soon(function() {
          ok(disconnected);
          this.app.unload();
        }, this, 1, 1);
      })
      .should("pass OAuth in header when making XHR request", function() {
         this.app.run('#/');
         this.app.setAccessToken('5678');
         xhr = { setRequestHeader: function(name, value) { this[name] = value } };
         $(document).trigger('ajaxSend', xhr);
         equal('OAuth 5678', xhr['Authorization']);
         this.app.unload();
      })
    };
})(jQuery);
