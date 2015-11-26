// -- Sammy.js -- /plugins/sammy.mustache.js
// http://sammyjs.org
// Version: 0.7.6
// Built: 2014-08-26 10:45:33 +0300
(function(factory){if(typeof define==="function"&&define.amd){define(["jquery","sammy","mustache"],factory)}else{(window.Sammy=window.Sammy||{}).Mustache=factory(window.jQuery,window.Sammy,window.Mustache)}})(function($,Sammy,Mustache){Sammy.Mustache=function(app,method_alias){var mustache=function(template,data,partials){data=$.extend({},this,data);partials=$.extend({},data.partials,partials);return Mustache.to_html(template,data,partials)};if(!method_alias){method_alias="mustache"}app.helper(method_alias,mustache)};return Sammy.Mustache});