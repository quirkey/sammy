// -- Sammy.js -- /plugins/sammy.haml.js
// http://sammyjs.org
// Version: 0.7.0
// Built: 2011-07-30 16:55:44 -0700
(function(a){Sammy=Sammy||{};Sammy.Haml=function(e,c){var d={};var b=function(h,i,f){if(typeof f=="undefined"){f=h}var g=d[f];if(!g){g=d[f]=Haml(h)}return g(a.extend({},this,i))};if(!c){c="haml"}e.helper(c,b)}})(jQuery);
