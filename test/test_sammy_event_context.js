(function($) {
    with(jqUnit) {
      var test_app = new Sammy.Application(function() {
        this.silence_404 = false;
        this.element_selector = '#main';
      });
      var test_context = new Sammy.EventContext(test_app, 'get', '#/test/:test', {test: 'hooray'});

      context('Sammy', 'EventContext','init', {
        before: function() {
          this.app = test_app;
          this.context = test_context;
        }
      })
      .should('set app', function() {
        isObj(this.context.app, this.app);
      })
      .should('set verb', function() {
        equals(this.context.verb, 'get');
      })
      .should('set path', function() {
        equals(this.context.path, '#/test/:test');
      })
      .should('set params', function() {
        isObj(this.context.params, new Sammy.Object({test: 'hooray'}));
      });
      

      context('Sammy', 'EventContext', 'redirect', {
        before: function() {
          this.app = test_app;
          this.context = test_context;
        },
        after: function() {
          window.location.hash = '#';
        }
      })
      .should('set full location if url is provided', function() {
        this.context.redirect('sammy.html#/boosh');
        equals('#/boosh', window.location.hash);
      })
      .should('only set hash if location is prefixed with #', function() {
        this.context.redirect('#/blah');
        equals('#/blah', window.location.hash);
      });


      context('Sammy', 'EventContext', 'notFound', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('throw 404 error', function() {
        var context = this.context;
        raised(/404/, function() {
          context.notFound();
        });
      });


      // context('Sammy', 'EventContext', 'render', 'text', {
      //   before: function() {
      //     this.context = test_context;
      //   }
      // })
      // .should('put text in selector', function() {
      //   this.context.render('text', '#test_area', 'test it')
      //   equals($('#test_area').text(), 'test it');
      // })
      // .should('assume selector is the app element if none is passed', function() {
      //   this.context.render('text', 'im in main');
      //   equals(test_app.$element().text(), 'im in main');
      // });
      // 
      // 
      // context('Sammy', 'EventContext', 'render', 'html', {
      //   before: function() {
      //     this.context = test_context;
      //   }
      // })
      // .should('put html in selector', function() {
      //   this.context.render('html', '#test_area', '<div class="test_class">TEST!</div>')
      //   equals($('#test_area').html(), '<div class="test_class">TEST!</div>');
      // })
      // .should('assume selector is the app element if none is passed', function() {
      //   this.context.render('html', '<span>im in main</span>');
      //   equals(test_app.$element().html(), '<span>im in main</span>');
      // });
      

      context('Sammy', 'EventContext', 'template', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('put use srender to interpolate in content', function() {
        var rendered = this.context.template('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
        equals(rendered, '<div class="test_class">TEXT!</div>');
      })
      .should('should set the context of the template to the test_context', function() {
        this.context.blurgh = 'boosh';
        var rendered = this.context.template('<div class="test_class"><%= text %> <%= blurgh %></div>', {text: 'TEXT!'});
        equals(rendered, '<div class="test_class">TEXT! boosh</div>');
      });
      
      
      context('Sammy', 'EventContext', 'partial', {
        before: function() {
          this.context = test_context;
        }
      })
      .should('pass contents to callback', function() {
        var contents = '';
        this.context.partial('fixtures/partial.html', function(data) { contents = data; });
        soon(function () {
          equals(contents, '<div class="test_partial">PARTIAL</div>');
        });
      })
      .should('run through templating/srender if json is passed as an additional argument', function() {
        var contents = '';
        this.context.partial('fixtures/templated_partial.html', {name: 'TEMPLATE!', class_name: 'test_template'}, function(data) { 
          contents = data; 
        });
        soon(function () {
          equals(contents, '<div class="test_template">TEMPLATE!</div>');
        });
      });      
      
      context('Sammy', 'EventContext', 'trigger', {
        before: function() {
          this.context = test_context;
          test_app.run();
        },
        after: function() {
          test_app.unload();
        }
      })
      .should('trigger custom event on application', function() {
        var spec_context = this;
        spec_context.event_fired = false;
        test_app.bind('custom', function() {
          spec_context.event_fired = true;
        });
        this.context.trigger('custom');
        soon(function() {
          equals(spec_context.event_fired, true);
        });
      })
      .should('set the context of the event to the Sammy.EventContext', function() {
        var spec_context = this;
        var event_context = null;
        test_app.bind('other.custom', function() {
          event_context = this;
        });
        this.context.trigger('other.custom');
        soon(function() {
          isObj(event_context, test_context);
        });
      })
      .should('pass data as an argument to the bound method', function() {
        var passed_data = null;
        var test_data   = {boosh: 'blurgh'};
        test_app.bind('custom-with-data', function(e, data) {
          passed_data = data;
        });
        this.context.trigger('custom-with-data', test_data);
        soon(function() {
          isObj(passed_data, test_data);
        });
      });
      
    };
})(jQuery);
