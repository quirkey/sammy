// -- Sammy.js -- /plugins/sammy.googleanalytics.js
// http://sammyjs.org
// Version: 0.7.1
// Built: 2012-01-21 16:40:20 -0800
(function(a){Sammy=Sammy||{};Sammy.GoogleAnalytics=function(g,e){var c=e||window.pageTracker,b=true;function f(){b=false}function d(){b=true}function h(i){if(typeof c!="undefined"){c._trackPageview(i)}else{if(typeof _gaq!="undefined"){_gaq.push(["_trackPageview",i])}}}this.helpers({noTrack:function(){f()},track:function(i){if((typeof c!="undefined"||typeof _gaq!="undefined")&&b){this.log("tracking",i);h(i)}}});this.bind("event-context-after",function(){this.track(this.path);d()})}})(jQuery);
