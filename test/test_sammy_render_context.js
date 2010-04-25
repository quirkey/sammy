(function($) {
    with(QUnit) {
            
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
              soon(test_callback, 1, expects);
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
              Sammy.log('render then', data);
              rdata = data;
            });
          };
          this.runRouteAndAssert(callback, function() {
            equal(rdata, '<div class="class">test</div>', "render contents");
          }, 1);
        })
        .pending('swap the rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}).swap();
          };
        })
        .pending('add a callback with data', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name:'test'}, function(data) {
              $('#test_area').html(data);
            });
          };
        })
        .pending('replace with rendered contents', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test'})
            .replace('#test_area');
          };
        })
        .pending('append rendered contents', function() {
          var callback = function(context) {
            $('#test_area').html('<div class="original">test</div>')
            this.render('fixtures/partial.template', {class_name: 'class', name: 'test'})
            .appendTo('#test_area');
          };
        })
        .pending('append then pass data to then', function() {
          var callback = function(context) {
            this.load('fixtures/partial.html')
              .appendTo('#test_area')
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area');
              });
          };
        })
        .pending('call multiple then callbacks in order', function() {
          var callback = function(context) {
            this.name = 'test';
            this.class = 'class';
            this.render('fixtures/partial.template')
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area');
              })
              .then(function(data) {
                $(data).addClass('blah2').appendTo('#test_area');
              });
          };
        })
        .pending('load a file then render', function() {
          var callback = function(context) {
            this.load('list.html')
              .replace('#test_area')
              .render('fixtures/partial.template')
              .then(function(data) {
                $(data).addClass('blah').appendTo('#test_area');
              })
              .then(function(data) {
                $(data).addClass('blah2').appendTo('#test_area');
              });
          };
        })
        .pending('chain multiple renders', function() {
          var callback = function(context) {
            this.render('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'})
                .render('fixtures/partial.template').appendTo('.class-name');
          };
        })
        .pending('swap data with partial', function() {
          var callback = function(context) {
            this.partial('fixtures/partial.template', {'name': 'name', 'class_name': 'class-name'});
          };
        });
        
      
      
    };
})(jQuery);