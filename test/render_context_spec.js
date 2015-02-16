describe('RenderContext', function() {
  // wrap jQuery get so that we can count how many times it's called
  var original_ajax = jQuery.ajax;
  jQuery.ajax = function() {
    jQuery.ajaxcount = jQuery.ajaxcount || 0;
    jQuery.ajaxcount++;
    Sammy.log('jQuery.ajax', arguments, jQuery.ajaxcount);
    original_ajax.apply(this, arguments);
  };

  var app, context;

  beforeEach(function() {
    app = new Sammy.Application(function() {
      this.raise_errors = false;
      this.element_selector = '#main';
      this.use(Sammy.Template);
      this.use(Sammy.Mustache);
    });
    context = new app.context_prototype(app, 'get', '#/test/:test', {test: 'hooray'});
  });

  it('passes rendered data to the callback', function(done) {
    context.name = 'test';
    context.class_name = 'class';
    context.render('fixtures/partial.template').then(function(data) {
      expect(data).to.eql('<div class="class">test</div>');
      done();
    });
  });

  it('loads the contents from inside a jQuery object', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main2').html('<div class="inline-template-1"><div class="name"></div></div>');
        context.load($('.inline-template-1'))
               .then(function(content) {
                 return $(content).text('Sammy');
               })
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="name">Sammy</div></div>');
        expect($('#main2')).to.have.sameHTMLAs('<div id="main2"><div class="inline-template-1"><div class="name"></div></div></div>');
        app.unload();
        done();
      }
    });
  });

  it('loads the contents from inside a DOM element', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main2').html('<div class="inline-template-1"><div class="name"></div></div>');

        context.load($('.inline-template-1')[0])
               .then(function(content) {
                 return $(content).text('Sammy');
               })
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="name">Sammy</div></div>');
        expect($('#main2')).to.have.sameHTMLAs('<div id="main2"><div class="inline-template-1"><div class="name"></div></div></div>');
        app.unload();
        done();
      }
    });
  });

  it('loads the contents from inside of a script tag', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main2').html('<script id="script-template" type="text/html" charset="utf-8" data-engine="template">' +
          '<div class="name"><%= name %></div>' +
        '</script>');

        context.load($('#script-template'))
               .interpolate({name: 'Sammy Davis'}, 'template')
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="name">Sammy Davis</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('interpolates the data using the engine set by load', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.load('fixtures/partial.template')
               .interpolate({name: 'Sammy Davis', class_name: 'clazz'})
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="clazz">Sammy Davis</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('loads an element and does not clone the element if clone: false', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main2').html('<div class="inline-template-1"><div class="name"></div></div>');

        context.load($('.inline-template-1'), {clone: false})
               .then(function(content) {
                 return $(content).text('Sammy');
               })
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="name">Sammy</div></div>');
        expect($('#main2').html()).to.be.empty();
        app.unload();
        done();
      }
    });
  });

  it('gets the engine from the data-engine attribute', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main2').html('<script id="script-template" type="text/html" charset="utf-8" data-engine="template">' +
          '<div class="name"><%= name %></div>' +
        '</script>');

        context.render($('#script-template'), {name: 'Sammy Davis'}).replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="name">Sammy Davis</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('caches the template by default', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main').html('');
        jQuery.ajaxcount = 0;
        app.clearTemplateCache();
        context.load('fixtures/partial.html')
               .appendTo('#main')
               .load('fixtures/partial.html')
               .appendTo('#main');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div></div>');
        expect(jQuery.ajaxcount).to.eql(1);
        app.unload();
        done();
      })
    });
  });

  it('caches the template if cache is not explicitly false', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main').html('');
        jQuery.ajaxcount = 0;
        app.clearTemplateCache();
        context.load('fixtures/partial.html', {cache: 0})
               .appendTo('#main')
               .load('fixtures/partial.html', {cache: 0})
               .appendTo('#main');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div></div>');
        expect(jQuery.ajaxcount).to.eql(1);
        app.unload();
        done();
      })
    });
  });

  it('does not cache the template if cache is explicitly false', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main').html('');
        jQuery.ajaxcount = 0;
        app.clearTemplateCache();
        context.load('fixtures/partial.html', {cache: false})
               .appendTo('#main')
               .load('fixtures/partial.html', {cache: false})
               .appendTo('#main');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="test_partial">PARTIAL</div><div class="test_partial">PARTIAL</div></div>');
        expect(jQuery.ajaxcount).to.eql(2);
        app.unload();
        done();
      })
    });
  });

  it('only caches json if cache is explicitly true', function(done) {
    jQuery.ajaxcount = 0;
    context.load('fixtures/partial.json', {cache: true})
           .load('fixtures/partial.json', {cache: true})
           .then(function() {
             expect(jQuery.ajaxcount).to.eql(1);
             done();
           });
  });

  it('does not cache json unless cache is explicitly true', function(done) {
    jQuery.ajaxcount = 0;
    context.load('fixtures/partial.json', {cache: 1})
           .load('fixtures/partial.json', {cache: 1})
           .then(function() {
             expect(jQuery.ajaxcount).to.eql(2);
             done();
           });
  });

  it('swaps the rendered contents', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.render('fixtures/partial.template', {class_name: 'class', name:'test'}).swap();
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class">test</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('adds a callback with data', function(done) {
    context.render('fixtures/partial.template', {class_name: 'class', name:'test'}, function(data) {
      expect(data).to.eql('<div class="class">test</div>');
      done();
    });
  });

  it('replaces the rendered contents', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.render('fixtures/partial.template', {class_name: 'class', name:'test2'}).replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class">test2</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('appends rendered contents', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main').html('<p>abc</p>');
        context.render('fixtures/partial.template', {class_name: 'class', name:'test'}).appendTo('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><p>abc</p><div class="class">test</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('uses the contents of a previous load as the data for render', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.load('fixtures/partial.json')
               .render('fixtures/partial.template')
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="original">json</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('detects json format when a query string is present', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.load('fixtures/partial.json?qs=1')
          .render('fixtures/partial.template')
          .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="original">json</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('appends then passes data to then', function(done) {
    $('#main').html('');
    context.load('fixtures/partial.html')
           .appendTo('#main')
           .then(function(data) {
             expect($.trim(data)).to.eql('<div class="test_partial">PARTIAL</div>');
             expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="test_partial">PARTIAL</div></div>');
             done();
           });
  });

  it('prepends the rendered contents', function(done) {
    listenToChanged(app, {
      setup: function() {
        $('#main').html('<p>abc</p>');
        context.render('fixtures/partial.template', {class_name: 'class', name:'test'}).prependTo('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class">test</div><p>abc</p></div>');
        app.unload();
        done();
      }
    });
  });

  it('prepends then passes data to then', function(done) {
    $('#main').html('<p>abc</p>');
    context.render('fixtures/partial.template', {class_name: 'class', name:'test'})
           .prependTo('#main')
           .then(function(data) {
             expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class">test</div><p>abc</p></div>');
             expect(data).to.eql('<div class="class">test</div>');
             done();
           });
  });

  it('calls multiple then callbacks in order', function(done) {
    var result = '';
    context.name = 'test';
    context.class_name = 'class';
    context.render('fixtures/partial.template')
           .then(function(data) {
             result += '1' + data;
           })
           .then(function(data) {
             result += '2' + data;
             expect(result).to.eql('1<div class="class">test</div>2<div class="class">test</div>');
             done();
           });
  });

  it('loads a file then renders', function(done) {
    context.load('fixtures/list.html')
           .replace('#main')
           .render('fixtures/partial.template', {name: 'my name', class_name: 'class'})
           .then(function(data) {
             $(data).addClass('blah').appendTo('#main ul');
           })
           .then(function(data) {
             $(data).addClass('blah2').appendTo('#main ul');
             expect($('#main')).to.have.sameHTMLAs('<div id="main"><ul><div class="class blah">my name</div><div class="class blah2">my name</div></ul></div>');
             done();
           });

  });

  it('chains multiple renders', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.render('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'})
               .replace('#main')
               .render('fixtures/other_partial.template', {'name': 'other name'})
               .appendTo('.class-name');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class-name">name<span>other name</span></div></div>');
        app.unload();
        done();
      })
    });
  });

  it('renders with partials and callbacks and data', function(done) {
    context.render('fixtures/partial.mustache', {name: 'my name', class_name: 'class'}, function(data) {
      expect(data).to.eql('<div class="class"><span>my name</span></div>');
      done();
    }, {item: 'fixtures/item.mustache'});
  });

  it('renders with partials without callback but with data', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.render('fixtures/partial.mustache', {name: 'my name', class_name: 'class'}, {item: 'fixtures/item.mustache'})
               .replace('#main');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class"><span>my name</span></div></div>');
        app.unload();
        done();
      }
    });
  });

  it('renders with partials without data but with callback', function(done) {
    context.render('fixtures/partial2.mustache', function(data) {
      expect(data).to.eql('<div class="blah"><span>my name</span></div>');
      done();
    }, {item: 'fixtures/item2.mustache'});
  });

  it('iterates and collects with each', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.load('fixtures/list.html')
               .replace('#main')
               .collect([{'name': 'first'}, {'name': 'second'}], function(i, item) {
                 return "<li>" + item.name + "</li>";
               })
               .appendTo('#main ul');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><ul><li>first</li><li>second</li></ul></div>');
        app.unload();
        done();
      })
    });
  });

  it('renders each with a collection', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.load('fixtures/list.html')
               .replace('#main')
               .renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}])
               .appendTo('#main ul');
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><ul><li class="item">first</li><li class="item">second</li></ul></div>');
        app.unload();
        done();
      })
    });
  });

  it('renders each with a callback', function(done) {
    context.load('fixtures/list.html')
           .replace('#main')
           .renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}], function(object, template) {
             $('#main ul').append(template);
           })
           .then(function() {
             expect($('#main')).to.have.sameHTMLAs('<div id="main"><ul><li class="item">first</li><li class="item">second</li></ul></div>');
             done();
           });
  });

  it('swaps data with partial', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.partial('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'});
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="class-name">name</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('runs commands within a render function as if they were chained', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.render(function() {
          this.load('fixtures/list.html');
          this.replace('#main');
          this.renderEach('fixtures/item.template', 'item', [{'name': 'first'}, {'name': 'second'}]);
          this.appendTo('#main ul');
        });
      },
      onChange: evaluateSecondCall(function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><ul><li class="item">first</li><li class="item">second</li></ul></div>');
        app.unload();
        done();
      })
    });
  });

  it('sends a function without arguments and waits for the callback', function(done) {
    listenToChanged(app, {
      setup: function() {
        var loadJSON = function(callback) {
          $.getJSON('fixtures/partial.json', callback);
        };
        context.send(loadJSON)
               .partial('fixtures/partial.template');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="original">json</div></div>');
        app.unload();
        done();
      }
    });
  });

  it('sends a function with arguments and waits for the callback', function(done) {
    listenToChanged(app, {
      setup: function() {
        context.send($.getJSON, 'fixtures/partial.json')
               .partial('fixtures/partial.template');
      },
      onChange: function() {
        expect($('#main')).to.have.sameHTMLAs('<div id="main"><div class="original">json</div></div>');
        app.unload();
        done();
      }
    });
  });
});
