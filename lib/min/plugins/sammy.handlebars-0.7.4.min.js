// -- Sammy.js -- /plugins/sammy.handlebars.js
// http://sammyjs.org
// Version: 0.7.4
// Built: 2013-01-27 13:34:13 -0500
(function(e){typeof define=="function"&&define.amd?define(["jquery","sammy","handlebars"],e):(window.Sammy=window.Sammy||{}).Handlebars=e(window.jQuery,window.Sammy,window.Handlebars)})(function(e,t,n){return t.Handlebars=function(t,r){var i={},s=function(t,r,s,o){typeof o=="undefined"&&(o=t);var u=i[o];return u||(u=i[o]=n.compile(t)),r=e.extend({},this,r),s=e.extend({},r.partials,s),u(r,{partials:s})};r||(r="handlebars"),t.helper(r,s)},t.Handlebars});