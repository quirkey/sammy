(function($) {
  
  with(jqUnit) {
    
    context('Sammy', 'EventContext','init')
    .should_eventually('set verb, path')
    .should_eventually('set params');
    
    context('Sammy', 'EventContext', 'redirect')
    .should_eventually('set full location if url is provided')
    .should_eventually('only set hash if location is prefixed with #');
    
    context('Sammy', 'EventContext', 'raise')
    .should_eventually('throw error');
    
    context('Sammy', 'EventContext', 'not_found')
    .should_eventually('throw not found error')
    
    context('Sammy', 'EventContext', 'render')
    
    
  };
  
})(jQuery);
