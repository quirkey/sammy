(function($) {
    with(jqUnit) {
      
      var stores = ['memory', 'cookie', 'local', 'session'];
      
      $.each(stores, function(i, store_type) {
        
        context('Sammy.Store', store_type {
           before: function() {
             this.store = new Sammy.Store('test_store', store_type);
           }
         })
         .should('set store type', function() {
           
         })
         .should('set name', function() {
           
         })
         .should('set and retrieve value as string', function() {
           
         })
         .should('set and retrieve value as JSON', function() {
           
         })
         .should('should store in global space accessible by name', function() {
           
         })
         .should('clear value', function() {
           
         })
         .should('return list of keys', function() {
           
         })
         .should('clear all values', function() {
           
         })
         .should_eventually('fire events on get and set') 
         .should_eventually('fetch value if set', function() {})
         .should_eventually('run callback on fetch if not set')

      });
  }
})(jQuery);