// -- Sammy.js -- /plugins/sammy.path_location_proxy.js
// http://sammyjs.org
// Version: 0.7.0
// Built: 2011-07-30 16:55:49 -0700
(function(a){Sammy=Sammy||{};Sammy.PathLocationProxy=function(b){this.app=b};Sammy.PathLocationProxy.prototype={bind:function(){},unbind:function(){},getLocation:function(){return[window.location.pathname,window.location.search].join("")},setLocation:function(b){return window.location=b}}})(jQuery);
