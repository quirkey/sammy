(function($) {
    with(QUnit) {
      
      function sameHTML(actual, expected) {
        equal($(actual)[0].outerHTML, $(expected)[0].outerHTML);
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
        });

      
      
    };
})(jQuery);