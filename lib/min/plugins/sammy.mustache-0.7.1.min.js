// -- Sammy.js -- /plugins/sammy.mustache.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:24 -0800
(function(a){Sammy=Sammy||{};Sammy.Mustache=function(d,b){var c=function(f,g,e){g=a.extend({},this,g);e=a.extend({},g.partials,e);return Mustache.to_html(f,g,e)};if(!b){b="mustache"}d.helper(b,c)}})(jQuery);
