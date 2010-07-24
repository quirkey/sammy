(function($) {
  

  Sammy = Sammy || {};

  Sammy.Meld = function(app, method_alias) {
    
    var meld = function(template, data) {
      var $template = $(template);
      if (typeof data === 'string') { 
        $template.html(data);
      } else {
        $.each(data, function(key, value) {
          var $sub = $template.filter('.' + key),
              $container,
              $item,
              is_list = false,
              subindex;  
          if ($sub.length === 0) { $sub = $template.find('.' + key); }
          // Sammy.log('$template', $template[0], '$sub', $sub[0], 'template', template, 'key', key, 'value', value);
          if ($sub.length > 0) {
            if ($.isArray(value)) {
              $container = $('<div/>');
              if ($sub.is('ol, ul')) {
                is_list = true;
                $item   = $sub.children('li:first');
                if ($item.length == 0) { 
                  $item = $('<li/>');
                }
              } else {
                $item = $sub.clone();
              }
              for (var i = 0; i < value.length; i++) {
                $container.append(meld($item.clone(), value[i]));
              }
              if (is_list) {
                $sub.html($container.html());
              } else if ($sub[0] == $template[0]) {
                $template = $($container.html());
              } else if ((subindex = $template.index($sub)) >= 0) {
                var args = [subindex, 1];
                args = args.concat($container.children().get());
                $template.splice.apply($template, args);
              }
            } else if (typeof value === 'object') {
              $sub.html(meld($sub.html(), value));
            } else {
              $sub.html(value.toString());
            }
          }
        });
      }
      var dom = $template;
      return dom;
    };
    
    // set the default method name/extension
    if (!method_alias) method_alias = 'meld'; 
    // create the helper at the method alias
    app.helper(method_alias, meld);
    
  };

})(jQuery);