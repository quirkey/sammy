// -- Sammy.js -- /plugins/sammy.exceptional.js
// http://sammyjs.org
// Version: 0.7.0
// Built: 2011-07-30 16:55:40 -0700
(function(a){Sammy=Sammy||{};Sammy.Exceptional=function(c,b){b=b||window.Exceptional;c.bind("error",function(f,d){if(d&&d.error){b.handle(d.error.message,window.location.href,"0")}})}}(jQuery));
