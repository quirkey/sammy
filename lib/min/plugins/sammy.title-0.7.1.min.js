// -- Sammy.js -- /plugins/sammy.title.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:30 -0800
(function(a){Sammy=Sammy||{};Sammy.Title=function(){this.setTitle=function(b){if(!a.isFunction(b)){this.title_function=function(c){return[b,c].join(" ")}}else{this.title_function=b}};this.helper("title",function(){var b=a.makeArray(arguments).join(" ");if(this.app.title_function){b=this.app.title_function(b)}document.title=b})}})(jQuery);
