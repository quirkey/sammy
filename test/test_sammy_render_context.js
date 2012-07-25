(function($) {
    with(QUnit) {

      // wrap jQuery get so that we can count how many times its called
      var original_ajax = jQuery.ajax;
      jQuery.ajax = function() {
        jQuery.ajaxcount = jQuery.ajaxcount || 0;
        jQuery.ajaxcount++;
        Sammy.log('jQuery.ajax', arguments, jQuery.ajaxcount);
        original_ajax.apply(this, arguments);
      };

      context('Sammy', 'RenderContext', {
          before: function() {
            var test_app = new Sammy.Application(function() {
              this.raise_errors = false;
              this.element_selector = '#main';
              this.use(Sammy.Template);
              this.use(Sammy.Mustache);
            });
            var test_context = new test_app.context_prototype(test_app, 'get', '#/test/:test', {test: 'hooray'});
            this.runRouteAndAssert = function(callback, test_callback, expects) {
              callback.apply(test_context, [test_context]);
              soon(test_callback, this, 2, expects);
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
            sameHTML(rdata, '<div class="class">test</div>', "render contents");
          });
        })
        .should('load the contents from inside a jQuery object', function() {
          var callback = function(context) {
            this.load($('.inline-template-1'))
                .then(function(content) {
                  return $(content).text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="name">Sammy</div>', "render contents");
            equal($('#main div.name').length, 2, "copied, not destroyed the element");
          }, 2);
        })
        .should('load the contents from inside a DOM element', function() {
          var callback = function(context) {
            this.load($('.inline-template-1')[0])
                .then(function(content) {
                  return $(content).text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="name">Sammy</div>', "render contents");
            equal($('#main div.name').length, 2, "copied, not destroyed the element");
          }, 2);
        })
        .should('load the contents from the inside of a script tag', function() {
          var callback = function(context) {
            this.load($('#script-template'))
                .interpolate({name: 'Sammy Davis'}, 'template')
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($.trim($('#test_area').html()), '<div class="name">Sammy Davis</div>', "render contents");
          });
        })
        .should('interpolate the data using the engine set by load', function() {
            var callback = function(context) {
              this.load('fixtures/partial.template')
                  .interpolate({name: 'Sammy Davis', class_name: 'clazz'})
                  .replace('#test_area');
            };
            this.runRouteAndAssert(callback, function() {
              sameHTML($.trim($('#test_area').html()), '<div class="clazz">Sammy Davis</div>', "render contents");
            });            
        })
        .should('load an element and not clone the element if clone: false', function() {
          var callback = function(context) {
            this.load($('.inline-template-1'), {clone: false})
                .then(function(content) {
                  return $(content).text('Sammy');
                })
                .replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="name">Sammy</div>', "render contents");
            equal($('#main div.name').length, 1, "removed the original element");
          }, 2);
        })
        .should('get the engine from the data-engine attribute', function() {
          var callback = function(context) {
            this.render($('#script-template'), {name: 'Sammy Davis'}).replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($.trim($('#test_area').html()), '<div class="name">Sammy Davis</div>', "render contents");
          });
        })
        .should('cache the template by default', function() {
          var callback = function(context) {
            jQuery.ajaxcount = 0;
            this.app.clearTemplateCache();
            Sammy.log('should only fetch the template once', 'ajaxcount', jQuery.ajaxcount);
            this.load('fixtures/partial.html')
                .appendTo('#test_area')
                .load('fixtures/partial.html')
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
            equal(jQuery.ajaxcount, 1);
          }, 2);
        })
        .should('cache the template if cache is not explicitly false', function() {
            var callback = function(context) {
              jQuery.ajaxcount = 0;
              this.app.clearTemplateCache();
              Sammy.log('should only fetch the template once', 'ajaxcount', jQuery.ajaxcount);
              this.load('fixtures/partial.html', {cache: 0})
                  .appendTo('#test_area')
                  .load('fixtures/partial.html', {cache: 0})
                  .appendTo('#test_area');
            };
            this.runRouteAndAssert(callback, function() {
              sameHTML($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
              equal(jQuery.ajaxcount, 1);
            }, 2);            
        })
        .should('not cache the template if cache is explicitly false', function() {
          var callback = function(context) {
            jQuery.ajaxcount = 0;
            Sammy.log('should not cache', 'ajaxcount', jQuery.ajaxcount);
            this.load('fixtures/partial.html', {cache: false})
                .appendTo('#test_area')
                .load('fixtures/partial.html', {cache: false})
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
            equal(jQuery.ajaxcount, 2);
          }, 2);
        })
        .should('only cache json if cache is explicitly true', function() {
            var callback = function(context) {
              jQuery.ajaxcount = 0;
              this.app.clearTemplateCache();
              Sammy.log('should only fetch the template once', 'ajaxcount', jQuery.ajaxcount);
              this.load('fixtures/partial.json', {cache: true})
                  .load('fixtures/partial.json', {cache: true});
            };
            this.runRouteAndAssert(callback, function() {
              equal(jQuery.ajaxcount, 1);
            }, 1);
        })
        .should('not cache json unless cache is explicitly true', function() {
            var callback = function(context) {
              jQuery.ajaxcount = 0;
              this.app.clearTemplateCache();
              Sammy.log('should only fetch the template once', 'ajaxcount', jQuery.ajaxcount);
              this.load('fixtures/partial.json', {cache: 1})
                  .load('fixtures/partial.json', {cache: 1});
            };
            this.runRouteAndAssert(callback, function() {
              equal(jQuery.ajaxcount, 2);
            }, 1);            
        })
        .should('swap the rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}).swap();
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#main').html(), '<div class="class">test</div>', "render contents");
          });
        })
        .should('add a callback with data', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}, function(data) {
              $('#test_area').html(data);
            });
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class">test</div>', "render contents");
          });
        })
        .should('replace with rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test2'}).replace('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class">test2</div>', "render contents");
          });
        })
        .should('append rendered contents', function() {
          var callback = function(context) {
            $('#test_area').html('<div class="original">test</div>')
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test'}).appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="original">test</div><div class="class">test</div>', "render contents");
          });
        })
        .should('use the contents of a previous load as the data for render', function() {
          var callback = function(context) {
            this.load('fixtures/partial.json')
                .render('fixtures/partial.template')
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="original">json</div><div class="class">test</div>', "render contents");
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
            sameHTML($('#test_area').html(), '<div class="test_partial">PARTIAL</div><div class="test_partial blah">PARTIAL</div>', "render contents");
          });
        })
        .should('prepend rendered contents', function() {
          var callback = function(context) {
            $('#test_area').html('<div class="original">test</div>')
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test'}).prependTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class">test</div><div class="original">test</div>', "render contents");
          });
        })
        .should('prepend then pass data to then', function() {
          var callback = function(context) {
            this.load('fixtures/partial.html')
              .prependTo('#test_area')
              .then(function(data) {
                $(data).addClass('blah').prependTo('#test_area');
              });
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="test_partial blah">PARTIAL</div><div class="test_partial">PARTIAL</div>', "render contents");
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
            sameHTML($('#test_area').html(), '<div class="class blah">test</div><div class="class blah2">test</div>', "render contents");
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
            sameHTML($('#test_area').html(), '<ul><div class="class blah">my name</div><div class="class blah2">my name</div></ul>', "render contents");
          });
        })
        .should('chain multiple renders', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'}).replace('#test_area')
                .render('fixtures/other_partial.template', {'name': 'other name'}).appendTo('.class-name');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class-name">name<span>other name</span></div>');
          });
        })
        .should('render with partials and callback and data', function() {
          var callback = function(context) {
            this.render('fixtures/partial.mustache', {name: 'my name', class_name: 'class'}, function(data) {
              $('#test_area').html(data);
            }, {item: 'fixtures/item.mustache'});
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class"><span>my name</span></div>', "render contents");
          });
        })
        .should('render with partials without callback but with data', function() {
          $('#test_area').html('');
          var callback = function(context) {
            this.render('fixtures/partial.mustache', {name: 'my name', class_name: 'class'}, {item: 'fixtures/item.mustache'})
                .appendTo('#test_area');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="class"><span>my name</span></div>', "render contents");
          });          
        })
        .should('render with partials without data but with callback', function() {
          var callback = function(context) {
            this.render('fixtures/partial2.mustache', function(data) {
              $('#test_area').html(data);
            }, {item: 'fixtures/item2.mustache'});
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<div class="blah"><span>my name</span></div>', "render contents");
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
            sameHTML($('#test_area').html(), '<ul><li>first</li><li>second</li></ul>');
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
            sameHTML($('#test_area').html(), '<ul><li class="item">first</li><li class="item">second</li></ul>');
          });
        })
        .should('renderEach with a callback', function() {
          var callback = function(context) {
            this.load('fixtures/list.html')
                .replace('#test_area')
                .renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}], function(object, template) {
                  $('#test_area ul').append(template);
                });
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#test_area').html(), '<ul><li class="item">first</li><li class="item">second</li></ul>');
          });          
        })
        .should('swap data with partial', function() {
          var callback = function(context) {
            this.partial('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'});
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#main').html(), '<div class="class-name">name</div>', "render contents");
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
            sameHTML($('#test_area').html(), '<ul><li class="item">first</li><li class="item">second</li></ul>');
          });
        })
        .should('send a function without arguments and wait for the callback', function() {
          var callback = function(context) {
            var loadJSON = function(callback) {
              $.getJSON('fixtures/partial.json', callback);
            };
            this.send(loadJSON)
                .partial('fixtures/partial.template');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#main').html(), '<div class="original">json</div>', "render contents");
          });
        })
        .should('send a function with arguments and wait for the callback', function() {
          var callback = function(context) {
            this.send($.getJSON, 'fixtures/partial.json')
                .partial('fixtures/partial.template');
          };
          this.runRouteAndAssert(callback, function() {
            sameHTML($('#main').html(), '<div class="original">json</div>', "render contents");
          });
        });



    };
})(jQuery);
