(function($) {
  with(QUnit) {

      console.log("This is test of RelativeHash")

      context(
        'Sammy.RelativeHash'
        , {
          before: function() {
            var hashPrefix = '#'
            this.app = new Sammy.Application(function() {
              this.use('RelativeHash', hashPrefix)
            }) // end new app
            this.context = new this.app.context_prototype(this.app, 'get', hashPrefix + '/', {});
          }
        }
      )
      .should('Making sure filter works', function() {
        var a = this.app.setLocationFilter.filter('#/aaaa/bbbb/cccc/eeee/')
        equal(
            a
            , '#/aaaa/bbbb/cccc/eeee/'
        )

        a = this.app.setLocationFilter.filter('#/aaaa/bbbb/cccc/dddd')
        equal(
            a
            , '#/aaaa/bbbb/cccc/dddd'
        )
      })
      .should('Making sure setLocation still works', function() {
        this.app.setLocation('#/aaaa/bbbb/cccc/eeee/')
        equal(
            window.location.hash
            , '#/aaaa/bbbb/cccc/eeee/'
            , "Making sure setLocation still works."
        )

        this.app.setLocation('#/aaaa/bbbb/cccc/dddd')
        equal(
            window.location.hash
            , '#/aaaa/bbbb/cccc/dddd'
            , "Making sure setLocation still works."
        )
      })
      .should('setLocation + RelativeHash', function() {
        this.app.setLocation('#/aaaa/bbbb/cccc/eeee/')
        this.app.setLocation('#../../folder/file')
        equal(
            window.location.hash
            , '#/aaaa/bbbb/folder/file'
            , "Making sure setLocation works."
        )

        this.app.setLocation('#/aaaa/bbbb/cccc/dddd')
        this.app.setLocation('#../../folder/file')
        equal(
            window.location.hash
            , '#/aaaa/folder/file'
            , "Making sure setLocation works."
        )

        this.app.setLocation('#/aaaa/bbbb/cccc/eeee/')
        this.app.setLocation('#./folder/file')
        equal(
            window.location.hash
            , '#/aaaa/bbbb/cccc/eeee/folder/file'
            , "Making sure setLocation works."
        )

        this.app.setLocation('#/aaaa/bbbb/cccc/dddd')
        this.app.setLocation('#./folder/file')
        equal(
            window.location.hash
            , '#/aaaa/bbbb/cccc/folder/file'
            , "Making sure setLocation works."
        )
      })
      .should('Testing click trigger on a tag', function() {
        var starthash, endhash, relHash

        starthash = '#/aaaa/bbbb/cccc/eeee/'
        relHash = "#../../folder/file"
        endhash = '#/aaaa/bbbb/folder/file'
        endfull = window.location.href.split(window.location.hash, 1)[0] + endhash

        this.app.setLocation(starthash)

        // window.location.href.split(window.location.hash, 1)[0]
        
        var $a = $('<a href="'+ relHash +'">Test Link</a>')
              .appendTo(this.app.$element())
              .trigger('click')
        soon(
          function() {
            equal(
              this.element[0].getAttribute('href')
              , this.endhash
            )
            equal(
              this.element[0].href
              , this.endfull
            )

            $a.remove()
          }
          , {'element': $a, 'endhash': endhash, 'endfull': endfull }
          , 1 // seconds
          , 2 // asserts
        );
      })
      .should('Testing click trigger on a tag', function() {
        var starthash, endhash, relHash

        starthash = '#/aaaa/bbbb/cccc/dddd'
        relHash = "#../../folder/file"
        endhash = '#/aaaa/folder/file'
        endfull = window.location.href.split(window.location.hash, 1)[0] + endhash

        this.app.setLocation(starthash)

        // window.location.href.split(window.location.hash, 1)[0]
        
        var $a = $('<a href="'+ relHash +'">Test Link</a>')
              .appendTo(this.app.$element())
              .trigger('click')
        soon(
          function() {
            equal(
              this.element[0].getAttribute('href')
              , this.endhash
            )
            equal(
              this.element[0].href
              , this.endfull
            )

            $a.remove()
          }
          , {'element': $a, 'endhash': endhash, 'endfull': endfull }
          , 1 // seconds
          , 2 // asserts
        );
      })
      .should('Testing click trigger on a tag', function() {
        var starthash, endhash, relHash

        starthash = '#/aaaa/bbbb/cccc/dddd'
        relHash = "#./folder/file"
        endhash = '#/aaaa/bbbb/cccc/folder/file'
        endfull = window.location.href.split(window.location.hash, 1)[0] + endhash

        this.app.setLocation(starthash)

        // window.location.href.split(window.location.hash, 1)[0]
        
        var $a = $('<a href="'+ relHash +'">Test Link</a>')
              .appendTo(this.app.$element())
              .trigger('click')
        soon(
          function() {
            equal(
              this.element[0].getAttribute('href')
              , this.endhash
            )
            equal(
              this.element[0].href
              , this.endfull
            )

            $a.remove()
          }
          , {'element': $a, 'endhash': endhash, 'endfull': endfull }
          , 1 // seconds
          , 2 // asserts
        );
      })

  };
})(jQuery);
