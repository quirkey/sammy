(function($) {
  

  Sammy = Sammy || {};

  Sammy.Meld = function(app, method_alias) {
    
    var meld = function(template, data) {
      var $template = $(template);
      $.each(data, function(key, value) {
        var $sub = $template.filter('.' + key);  
        Sammy.log('meld', $sub, template, key, value);
        if ($sub.length > 0) {
          if ($.isArray(value)) {
          
          } else if (typeof value === 'object') {
            return meld($sub, value);
          } else {
            Sammy.log('html')
            $sub.html(value);
          }
        }
      });
      return $template.get(0);
    };
    
    // set the default method name/extension
    if (!method_alias) method_alias = 'meld'; 
    // create the helper at the method alias
    app.helper(method_alias, meld);
    
  };

})(jQuery);