// -- Sammy.js -- /plugins/sammy.haml.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:21 -0800
(function(a){Sammy=Sammy||{};Sammy.Haml=function(e,c){var d={};var b=function(h,i,f){if(typeof f=="undefined"){f=h}var g=d[f];if(!g){g=d[f]=Haml(h)}return g(a.extend({},this,i))};if(!c){c="haml"}e.helper(c,b)}})(jQuery);
