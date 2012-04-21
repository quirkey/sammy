// -- Sammy.js -- /plugins/sammy.ejs.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:17 -0800
(function(a){Sammy=Sammy||{};Sammy.EJS=function(d,b){var c=function(f,g,e){if(typeof e=="undefined"){e=f}return new EJS({text:f,name:e}).render(g)};if(!b){b="ejs"}d.helper(b,c)}})(jQuery);
