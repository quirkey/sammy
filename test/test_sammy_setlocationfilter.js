(function($) {
  with(QUnit) {

      //if (Sammy.Store.isAvailable(store_type)) {
      context(
        'Sammy.SetLocationFilter'
        , {
          before: function() {
            this.app = new Sammy.Application(function() {
              
              this.findme = "#gotcha"

              this.use('SetLocationFilter')
              var badWordFilterToken = this.setLocationFilter.add(
                function(path, stop){
                  if (path === '#badword') {
                    stop() // no need to return. we die here.
                  }
                  return path
                }
              )
              var rewordFilterToken = this.setLocationFilter.add(
                function(path){
                  if (path === '#reword') {
                    return "#me"
                  }
                  return path
                }
              )
              var accessAppFilterToken = this.setLocationFilter.add(
                function(path){
                  if (path === '#iliketotouchmyself') {
                    return this.findme
                  }
                  return path
                }
              )
            }) // end new app

            this.context = new this.app.context_prototype(this.app, 'get', '#/', {});
          }
        }
      )
      .should('Filter must return reworded path', function() {
        ok(this.app)
        ok(this.context)
        ok(this.app.setLocationFilter)
        ok(this.app.setLocation)

        ok(this.app.setLocationFilter.filter)
        ok(this.app.setLocationFilter.add)
        ok(this.app.setLocationFilter.remove)

        equal(
            this.app.setLocationFilter.filter('#reword')
            , '#me'
            , "Simple switch of strings must occur."
        )

        equal(
            this.app.setLocationFilter.filter('#iliketotouchmyself')
            , '#gotcha'
            , "We should be able to see Sammy Application object"
        )

        var flag = {}
        , path = this.app.setLocationFilter.filter('#badword', flag)
        equal(
            flag.success
            , false
            , "Flag should be 'false' when one of the filters in the pipeline blows up"
        )
      })
      .should('Filter must return reworded path', function() {
        this.app.setLocation('#reword')
        equal(
            window.location.hash
            , '#me'
            , "Simple switch of strings must occur."
        )

        this.app.setLocation('#iliketotouchmyself')
        equal(
            window.location.hash
            , '#gotcha'
            , "We should be able to see Sammy Application object and pull value from there"
        )

        this.app.setLocation('#badword')
        equal(
            window.location.hash
            , '#gotcha'
            , "Switch should fail and we should stay on prior hash"
        )

      })

  };
})(jQuery);
