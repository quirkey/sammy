(function($) {

  Sammy = Sammy || {};
  
  function parseNestedParam(field_value, field_name, params) {
    var match, name, rest;
  
    if (field_name.match(/^[^\[]+$/)) {
      // basic value
      params[field_name] = unescape(field_value);
    } else if (match = field_name.match(/^([^\[]+)\[\](.*)$/)) {
      // array
      name = match[1];
      rest = match[2];
    
      if(params[name] && !$.isArray(params[name])) { throw('400 Bad Request'); }
    
      if (rest) {
        // array is not at the end of the parameter string
        match = rest.match(/^\[([^\]]+)\](.*)$/);
        if(!match) { throw('400 Bad Request'); }
      
        if (params[name]) {
          if(params[name][params[name].length - 1][match[1]]) {
            params[name].push(parseNestedParam(field_value, match[1] + match[2], {}));  
          } else {
            $.extend(true, params[name][params[name].length - 1], parseNestedParam(field_value, match[1] + match[2], {}));  
          }            
        } else {
          params[name] = [parseNestedParam(field_value, match[1] + match[2], {})];
        }                    
      } else {
        // array is at the end of the parameter string
        if (params[name]) {
          params[name].push(unescape(field_value));
        } else {
          params[name] = [unescape(field_value)];
        }          
      }
    } else if (match = field_name.match(/^([^\[]+)\[([^\[]+)\](.*)$/)) {
      // hash
      name = match[1];
      rest = match[2] + match[3];
    
      if (params[name] && $.isArray(params[name])) { throw('400 Bad Request'); }
    
      if (params[name]) {          
        $.extend(true, params[name], parseNestedParam(field_value, rest, params[name]));
      } else {
        params[name] = parseNestedParam(field_value, rest, {});
      }
    }
    return params;
  };

  Sammy.NestedParams = function(app) {

    $.extend(app, {
      _parseFormParams: function($form) {
        var params = {};
        $.each($form.serializeArray(), function(i, field) {
          $.extend(true, params, parseNestedParam(field.value, field.name, params));
        });

        return params;
      }
    });
    
  };
  
})(jQuery);
