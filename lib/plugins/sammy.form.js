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
      html += "</" + tag + ">";
    } else {
      html += " />";
    }
    return html;
  };
  
  Sammy.FormBuilder = function(name, object) {
    this.name   = name;
    this.object = object;
  };
  
  $.extend(Sammy.FormBuilder.prototype, {
    
    textField: function(keypath, attributes) {
      attributes = $.extend({type: 'text'}, this.attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },
    
    textArea: function(keypath, attributes) {
      var current;
      attributes = $.extend(this.attributesForKeyPath(keypath), attributes);
      current = attributes['value'];
      delete attributes['value'];
      return simple_element('textarea', attributes, current);
    },
    
    passwordField: function(keypath, attributes) {
      return this.textField(keypath, $.extend({type: 'password'}, attributes));
    },
    
    select: function(keypath, options, attributes) {
      var option_html = "", selected;
      attributes = $.extend(this.attributesForKeyPath(keypath), attributes);
      selected = attributes['value'];
      delete attributes['value'];
      $.each(options, function(i, option) {
        var value, text, option_attrs;
        if ($.isArray(option)) {
          value = option[1], text = option[0];
        } else {
          value = option, text = option;
        }
        option_attrs = {value: value};
        // select the correct option
        if (value === selected) { option_attrs['selected'] = 'selected'; }
        option_html += simple_element('option', option_attrs, text);
      });
      return simple_element('select', attributes, option_html);
    },
    
    submitField: function(attributes) {
      return simple_element('input', $.extend({'type': 'submit'}, attributes));
    },
    
    attributesForKeyPath: function(keypath) {
      var builder    = this,
          keys       = $.isArray(keypath) ? keypath : keypath.split(/\./), 
          name       = builder.name, 
          value      = builder.object,
          class_name = builder.name;
          
      $.each(keys, function(i, key) {
        if ((typeof value === 'undefined') || value == '') {
          value = ''
        } else if (typeof key == 'number' || key.match(/^\d+$/)) {
          value = value[parseInt(key, 10)];
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
      simple_element: simple_element,
      
      formFor: function(name, object, attributes, content_callback) {
        var builder = new Sammy.FormBuilder(name, object),
            content = content_callback.apply(this, [builder]);
            
        return simple_element('form', $.extend({'method': 'post'}, attributes), content);
      }
    });
    
  };
  
  
  
})(jQuery)
