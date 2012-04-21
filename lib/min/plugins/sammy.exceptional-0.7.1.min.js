// -- Sammy.js -- /plugins/sammy.exceptional.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:17 -0800
(function(a){Sammy=Sammy||{};Sammy.Exceptional=function(c,b){b=b||window.Exceptional;c.bind("error",function(f,d){if(d&&d.error){b.handle(d.error.message,window.location.href,"0")}})}}(jQuery));
