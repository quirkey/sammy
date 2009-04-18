(function($) {
  
  with(jqUnit) {
    var test_app = new Sammy.Application(function() {});
    var test_context = new Sammy.EventContext(test_app, 'get', '#/test/:test', {test: 'hooray'});
    
    context('Sammy', 'EventContext','init', {
      before: function() {
        this.app = test_app;
        this.context = test_context;
      }
    })
    .should('set app', function() {
      isObj(this.a('context').app, this.a('app'));
    })
    .should('set verb', function() {
      equals(this.a('context').verb, 'get');
    })
    .should('set path', function() {
      equals(this.a('context').path, '#/test/:test');
    })
    .should('set params', function() {
      isObj(this.a('context').params, {test: 'hooray'});
    });
    
    context('Sammy', 'EventContext', 'redirect')
    .should_eventually('set full location if url is provided')
    .should_eventually('only set hash if location is prefixed with #');
    
    context('Sammy', 'EventContext', 'raise')
    .should_eventually('throw error');
    
    context('Sammy', 'EventContext', 'not_found')
    .should_eventually('throw not found error')
    
    context('Sammy', 'EventContext', 'render', 'text', {
      before: function() {
        this.context = test_context;
        this.context.render('text', '#test_area', 'test it')
      }
    })
    .should('put text in selector', function() {
      equals($('#test_area').text(), 'test it');
    });
    
    context('Sammy', 'EventContext', 'render', 'html', {
      before: function() {
        this.context = test_context;
        this.context.render('html', '#test_area', '<div class="test_class">TEST!</div>')
      }
    })
    .should('put html in selector', function() {
      equals($('#test_area').html(), '<div class="test_class">TEST!</div>');
    });
    
    
  };
  
})(jQuery);
