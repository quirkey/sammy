// -- Sammy.js -- /plugins/sammy.ejs.js
// http://sammyjs.org
// Version: 0.7.0
// Built: 2011-07-30 16:55:40 -0700
(function(a){Sammy=Sammy||{};Sammy.EJS=function(d,b){var c=function(f,g,e){if(typeof e=="undefined"){e=f}return new EJS({text:f,name:e}).render(g)};if(!b){b="ejs"}d.helper(b,c)}})(jQuery);
