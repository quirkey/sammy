(function($) {
    with(QUnit) {
      
      function sameHTML(actual, expected) {
        var strippedHTML = function(element) {
          return $(element).wrap('<div></div>').parent().html().toString().replace(/(>)(\s+)(<)/g, "><");
        };
        
        actual = strippedHTML(actual);
        expected = strippedHTML(expected);
        Sammy.log("\nactual\n", actual, "\nexpected\n", expected);
        equal(actual, expected, "HTML is equal");
      };
      
      context('Sammy', 'Meld', {
          before: function() {
            var test_app = new Sammy.Application(function() {
              this.raise_errors = false;
              this.element_selector = '#main';
              this.use(Sammy.Meld);
            });
            this.test_context = new test_app.context_prototype(test_app, 'get', '#/test/:test', {test: 'hooray'});
            // $('#test_area').html('');
          }
        })
        .should('do simple interpolation', function() {
          var template = "<div class='title'></div>";
              data = {'title': 'TEST'},
              expected = "<div class='title'>TEST</div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('interpolate one level deep', function() {
          var template = "<div class='post'><div class='title'></div></div>";
              data = {'post': {'title': 'TEST'}},
              expected = "<div class='post'><div class='title'>TEST</div></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('interpolate multiple keys', function() {
          var template = "<div class='post'></div><div class='title'></div>";
              data = {'post': 'my post', 'title': 'TEST'},
              expected = "<div class='post'>my post</div><div class='title'>TEST</div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('interpolate multiple nested keys', function() {
          var template = "<div class='post'><div class='title'></div><div class='author'></div></div>";
              data = {'post': {'title': 'TEST', 'author': 'AQ'}},
              expected = "<div class='post'><div class='title'>TEST</div><div class='author'>AQ</div></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('not interpolate incorrectly nested keys', function() {
          var template = "<div class='post'></div><div class='title'></div>";
              data = {'post': {'title': 'TEST'}},
              expected = "<div class='post'></div><div class='title'></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('multiply an array of tags', function() {
          var template = "<div class='post'><span class='tags'></span></div>";
              data = {'post': {'tags': ['one', 'two']}},
              expected = "<div class='post'><span class='tags'>one</span><span class='tags'>two</span></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('multiply an array of objects', function() {
          var template = "<div class='post'><div class='authors'><h2 class='name'></h2><span class='twitter'></span></div></div>";
              data = {'post': {'authors': [{'name': 'AQ', 'twitter': 'aq'}, {'name':'Mike', 'twitter':'mrb_bk'}]}},
              expected = "<div class='post'><div class='authors'><h2 class='name'>AQ</h2><span class='twitter'>aq</span></div><div class='authors'><h2 class='name'>Mike</h2><span class='twitter'>mrb_bk</span></div></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('multiply an array on a list item', function() {
          var template = "<div class='post'><ul class='tags'></ul></div>";
              data = {'post': {'tags': ['one', 'two']}},
              expected = "<div class='post'><ul class='tags'><li>one</li><li>two</li></ul></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('multiply an array on a list item using the example list item', function() {
          var template = "<div class='post'><ol class='tags'><li class='tag'></li></ol></div>";
              data = {'post': {'tags': ['one', 'two']}},
              expected = "<div class='post'><ol class='tags'><li class='tag'>one</li><li class='tag'>two</li></ol></div>";
          sameHTML(this.test_context.meld(template, data), expected);
        })
        .should('render templates correctly', function() {
          var context = this.test_context, 
              templates = 2
          var getAndAssertTemplate = function(i) {
            var template, json, result;
            $.get('fixtures/meld/' + i + '.meld', function(t) {
              template = t;
              $.getJSON('fixtures/meld/' + i + '.json', function(j) {
                json = j;
                $.get('fixtures/meld/' + i + '.html', function(r) {
                  sameHTML(context.meld(template, json), r);
                  if (i == templates) {
                    start();
                  } else {
                    getAndAssertTemplate(i + 1);
                  }
                });
              });
            });
          }
          expect(templates);
          stop();
          getAndAssertTemplate(1);
        });
      
      
    };
})(jQuery);