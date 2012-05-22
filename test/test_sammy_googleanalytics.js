(function($) {
  with(QUnit) {

      console.log("This is test of RelativeHash")

      context(
        'Sammy.GoogleAnalytics'
        , {
          before: function() {
            var hashPrefix = '#'
            this.app = new Sammy.Application(function() {})
            this.context = new this.app.context_prototype(this.app, 'get', hashPrefix + '/', {});
          }
        }
      )
      .should('Making sure filter works', function() {
        equal(
          typeof Sammy.GoogleAnalytics
          , 'function'
        )
      })

  };
})(jQuery);
