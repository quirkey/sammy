(function($) {
  

  Sammy = Sammy || {};

  Sammy.Meld = function(app, method_alias) {
    
    var meld = function(template, data) {
      var $template = $(template);
      Sammy.log('* template', template, 'data', data);
      if (typeof data === 'string') { 
        $template.html(data);
      } else {
        $.each(data, function(key, value) {
          var $sub = $template.filter('.' + key);  
          if ($sub.length == 0) { $sub = $template.find('.' + key); }
          Sammy.log('$template', $template[0], '$sub', $sub[0], 'template', template, 'key', key, 'value', value);
          if ($sub.length > 0) {
            if ($.isArray(value)) {
              var $container = $('<div>');
              for (var i = 0; i < value.length; i++) {
                $container.append(meld($sub.clone(), value[i]));
              }
              if ($sub[0] == $template[0]) {
                $template = $($container.html());
              } else {
                $sub.replaceWith($container.html());
              }
            } else if (typeof value === 'object') {
              $sub.html(meld($sub.html(), value));
            } else {
              Sammy.log('html', value)
              $sub.html(value);
            }
          }
        });
      }
      var dom = $template[0];
      Sammy.log('* final', 'template', template, '$template', $template, 'data', data, 'result', dom);
      return dom;
    };
    
    // set the default method name/extension
    if (!method_alias) method_alias = 'meld'; 
    // create the helper at the method alias
    app.helper(method_alias, meld);
    
  };

})(jQuery);