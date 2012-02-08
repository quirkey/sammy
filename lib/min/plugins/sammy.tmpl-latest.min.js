// -- Sammy.js -- /plugins/sammy.tmpl.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:31 -0800
(function(a){Sammy=Sammy||{};Sammy.Tmpl=function(d,b){var c=function(f,g,e){if(typeof e=="undefined"){e=f}if(!jQuery.template[e]){jQuery.template(e,f)}return jQuery.tmpl(e,jQuery.extend({},this,g))};if(!b){b="tmpl"}d.helper(b,c)}})(jQuery);
