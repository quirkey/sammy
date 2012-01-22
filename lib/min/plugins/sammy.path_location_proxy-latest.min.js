// -- Sammy.js -- /plugins/sammy.path_location_proxy.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:26 -0800
(function(a){Sammy=Sammy||{};Sammy.PathLocationProxy=function(b){this.app=b};Sammy.PathLocationProxy.prototype={bind:function(){},unbind:function(){},getLocation:function(){return[window.location.pathname,window.location.search].join("")},setLocation:function(b){return window.location=b}}})(jQuery);
