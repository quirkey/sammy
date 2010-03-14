(function($) {
  
  Sammy = Sammy || {};
  
    
  function getStringContent(object, name, content) {
    if (typeof content === 'undefined') {
      return '';
    } else if ($.isFunction(content)) {
      content = content.apply(object, [name]);
    } 
    return content.toString();
  };
  
  function simple_element(tag, attributes, content) {
    var html = "<";
    html += tag;
    if (typeof attributes != 'undefined') {
      $.each(attributes, function(key, value) {
        html += " " + key + "='";
        html += getStringContent(attributes, key, value);
        html += "'";
      });
    }
    if (typeof content != 'undefined') {
      html += ">";
      html += getStringContent(this, 'content', content);
      html += "</" + tag + ">\n";
    } else {
      html += " />\n";
    }
    return html;
  };
  
  Sammy.FormBuilder = function(name, object) {
    this.name        = name;
    this.object = object;
  };
  
  $.extend(Sammy.FormBuilder.prototype, {
    
    textField: function(keypath, attributes) {
      var attributes = $.extend({type: 'text'}, this.attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },
    
    attributesForKeyPath: function(keypath) {
      var builder = this,
          keys = keypath.split(/\./), 
          name = builder.name, 
          value = builder.object,
          class_name = builder.name;
      $.each(keys, function(i, key) {
        Sammy.log(keys, key, value);
        if ((typeof value === 'undefined') || value == '') {
          value = ''
        } else {
          value = value[key];
        }
        name += "[" + key + "]";
        class_name += "-" + key;
      });
      return {'name': name, 
              'value': getStringContent(builder.object, keypath, value), 
              'class': class_name};
    }
  });
  
  Sammy.Form = function(app) {
    
    app.helpers({
      simple_element: simple_element
    });
    
  };
  
  
  
})(jQuery)
