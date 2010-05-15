(function($) {
    with(QUnit) {
            
      // wrap jQuery get so that we can count how many times its called
      jQuery.ajaxcount = 0;
      
      var original_ajax = jQuery.ajax;
      jQuery.ajax = function() {
        jQuery.ajaxcount++;
        original_ajax.apply(this, arguments);
      };
            
      context('Sammy', 'RenderContext', {
          before: function() {
            var test_app = new Sammy.Application(function() {
              this.raise_errors = false;
              this.element_selector = '#main';
              this.use(Sammy.Template);
            });
            var test_context = new test_app.context_prototype(test_app, 'get', '#/test/:test', {test: 'hooray'});
            this.runRouteAndAssert = function(callback, test_callback, expects) {
              callback.apply(test_context, [test_context]);
              soon(test_callback, this, 1, expects);
            };
            $('#test_area').html('');         
          }
        })        
        .should('pass rendered data to callback', function() {
          var rdata = null;
          var callback = function(context) {
            context.name = 'test';
            context.class_name = 'class';
            this.render('fixtures/partial.template').then(function(data) {
              rdata = data;
            });
          };
          this.runRouteAndAssert(callback, function() {
            equal(rdata, '<div class="class">test</div>', "render contents");
          });
        })
        .should('load the contents from a jQuery object', function() {
          var callback = function(context) {
            this.load($('.inline-template-1'))
                .then(function(content) {
                  content.find('.name').text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="inline-template-1"><div class="name">Sammy</div></div>', "render contents");
            equal($('.inline-template-1 div').length, 2, "copied, not destroyed the element");
          }, 2);
        })
        .should('load the contents from inside a DOM element', function() {
          var callback = function(context) {
            this.load($('.inline-template-1')[0])
                .then(function(content) {
                  $(content).text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="name">Sammy</div>', "render contents");
            equal($('.inline-template-1 div').length, 1, "copied, not destroyed the element");
          }, 2);
        })
        .should('load the contents from the inside of a script tag', function() {
          var callback = function(context) {
            this.load($('#script-template'))
                .interpolate({name: 'Sammy Davis'}, 'template')
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="name">Sammy Davis</div>', "render contents");
          });
        })
        .should('load an element and not clone the element if clone: false', function() {
          var callback = function(context) {
            this.load($('.inline-template-1'), {clone: false})
                .then(function(content) {
                  content.find('.name').text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="inline-template-1"><div class="name">Sammy</div></div>', "render contents");
            equal($('.inline-template-1 div').length, 1, "removed the original element");
          }, 2);
        })
        .should('get the engine from the data-engine attribute', function() {
          var callback = function(context) {
            this.render($('#script-template'), {name: 'Sammy Davis'}).replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="name">Sammy Davis</div>', "render contents");
          });
        })
        .should('only fetch the template once', function() {
          jQuery.ajaxcount = 0;
          var callback = function(context) {
            this.load('fixtures/partial.html')
                .appendTo('#test_area')
                .load('fixtures/partial.html')
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
            equal(jQuery.ajaxcount, 1);
          }, 2);
        })
        .should('not cache the template if cache: false', function() {
          jQuery.ajaxcount = 0;
          var callback = function(context) {
            this.load('fixtures/partial.html', {cache: false})
                .appendTo('#test_area')
                .load('fixtures/partial.html')
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
            equal(jQuery.ajaxcount, 2);
          }, 2);
        })
        .should('swap the rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}).swap();
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#main').html(), '<div class="class">test</div>', "render contents");
          });
        })
        .should('add a callback with data', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}, function(data) {
              $('#test_area').html(data);
            });
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="class">test</div>', "render contents");
          });
        })
        .should('replace with rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test2'}).replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="class">test2</div>', "render contents");
          });
        })
        .should('append rendered contents', function() {
          var callback = function(context) {
            $('#test_area').html('<div class="original">test</div>')
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test'}).appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="original">test</div><div class="class">test</div>', "render contents");
          });
        })
        .should('append then pass data to then', function() {
          var callback = function(context) {
            this.load('fixtures/partial.html')
              .appendTo('#test_area')
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area');
              });
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial blah">PARTIAL</div>', "render contents");
          });
        })
        .should('call multiple then callbacks in order', function() {
          var callback = function(context) {
            this.name = 'test';
            this.class_name = 'class';
            this.render('fixtures/partial.template')
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area');
              })
              .then(function(data) {
                $(data).addClass('blah2').appendTo('#test_area');
              });
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="class blah">test</div><div class="class blah2">test</div>', "render contents");
          });
        })
        .should('load a file then render', function() {
          var callback = function(context) {
            this.load('fixtures/list.html')
              .replace('#test_area')
              .render('fixtures/partial.template', {name: 'my name', class_name: 'class'})
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area ul');
              })
              .then(function(data) {
                $(data).addClass('blah2').appendTo('#test_area ul');
              });
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<ul><div class="class blah">my name</div><div class="class blah2">my name</div></ul>', "render contents");
          });
        })
        .should('chain multiple renders', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'}).replace('#test_area')
                .render('fixtures/other_partial.template', {'name': 'other name'}).appendTo('.class-name');
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<div class="class-name">name<span>other name</span></div>');
          });
        })
        .should('iterate and collect with each', function() {
          var callback = function(context) {
            this.load('fixtures/list.html').replace('#test_area')
                .collect([{'name': 'first'}, {'name': 'second'}], function(i, item) {
                  return "<li>" + item.name + "</li>";
                })
                .appendTo('#test_area ul')
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<ul><li>first</li><li>second</li></ul>');
          });
        })
        .should('renderEach with a collection', function() {
          var callback = function(context) {
            this.load('fixtures/list.html')
                .replace('#test_area')
                .renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}])
                .appendTo('#test_area ul')
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<ul><li class="item">first</li><li class="item">second</li></ul>');
          });
        })
        .should('swap data with partial', function() {
          var callback = function(context) {
            this.partial('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'});
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#main').html(), '<div class="class-name">name</div>', "render contents");
          });
        })
        .should('run commands within a render function as if they were chained', function() {
          var callback = function(context) {
            this.render(function() {
              this.load('fixtures/list.html');
              this.replace('#test_area');
              this.renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}]);
              this.appendTo('#test_area ul');
            });
          };
          this.runRouteAndAssert(callback, function() {
            equal($('#test_area').html(), '<ul><li class="item">first</li><li class="item">second</li></ul>');
          });
        });
        
      
      
    };
})(jQuery);