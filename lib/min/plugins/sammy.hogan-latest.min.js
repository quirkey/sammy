// -- Sammy.js -- /plugins/sammy.hogan.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-03-04 18:34:12 +0200
(function(a){Sammy=Sammy||{};Sammy.Hogan=function(d,b){var e={};var c=function(h,i,g){var f=e[f];if(!f){f=Hogan.compile(h)}i=a.extend({},this,i);g=a.extend({},i.partials,g);return f.render(i,g)};if(!b){b="hogan"}d.helper(b,c)}})(jQuery);