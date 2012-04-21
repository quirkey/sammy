// -- Sammy.js -- /plugins/sammy.handlebars.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:21 -0800
(function(a){Sammy=Sammy||{};Sammy.Handlebars=function(e,c){var d={};var b=function(i,j,g,f){if(typeof f=="undefined"){f=i}var h=d[f];if(!h){h=d[f]=Handlebars.compile(i)}j=a.extend({},this,j);g=a.extend({},j.partials,g);return h(j,{partials:g})};if(!c){c="handlebars"}e.helper(c,b)}})(jQuery);
