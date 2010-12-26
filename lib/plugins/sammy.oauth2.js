(function($) {
  Sammy = Sammy || {};

  // Sammy.OAuth2 is a plugin for using OAuth 2.0 to authenticate users and
  // access your application's API. Requires Sammy.Session.
  //
  // Triggers the following events:
  //
  // * `oauth.connected` - Access token set and ready to use. Triggered when new
  // access token acquired, of when application starts and already has access
  // token.
  // * `oauth.disconnected` - Access token reset. Triggered by
  // loseAccessToken().
  // * `oauth.denied` - Authorization attempt rejected.
  //
  // ### Example
  //
  //       this.use('Storage');
  //       this.use('OAuth2');
  //       this.oauthorize = "/oauth/authorize";
  //
  //       // The quick & easy way
  //       this.requireOAuth();
  //       // Specific path
  //       this.requireOAuth("/private");
  //       // Filter you can apply to specific URLs
  //       this.before(function(context) { return context.requireOAuth(); })
  //       // Apply to specific request
  //       this.get("/private", function(context) {
  //         this.requireOAuth(function() {
  //           // Do something
  //         });
  //       });
  //
  //      // Sign in/sign out.
  //      this.bind("oauth.connected", function() { $("#signin").hide() });
  //      this.bind("oauth.disconnected", function() { $("#signin").show() });
  //
  //      // Handle access denied and other errors
  //      this.bind("oauth.denied", function(evt, error) {
  //        this.partial("admin/views/no_access.tmpl", { error: error.message });
  //      });
  //
  //      // Sign out.
  //      this.get("#/signout", function(context) {
  //        context.loseAccessToken();
  //        context.redirect("#/");
  //      });
  //
  Sammy.OAuth2 = function(app) {
    app.use('JSON');
    this.authorize = "/oauth/authorize";

    // Use this on request that require OAuth token. You can use this in a
    // filter: it will redirect and return false if the access token is missing.
    // You can use it in a route, it will redirect to get the access token, or
    // call the callback function if it has an access token.
    this.helper("requireOAuth", function(cb) {
      if (this.app.getAccessToken()) {
        if (cb)
          cb.apply(this);
      } else {
        this.redirect(this.app.authorize + "?state=" + escape(this.path));
        return false;
      }
    });

    // Use this to sign out.
    this.helper("loseAccessToken", function() {
      this.app.loseAccessToken();
    });

    // Use this in your application to require an OAuth access token on all, or
    // the specified paths. It sets up a before filter on the specified paths.
    this.requireOAuth = function(options) {
      this.before(options || {}, function(context) {
        return context.requireOAuth();
      });
    }

    // Returns the access token. Uses Sammy.Session to store the token.
    this.getAccessToken = function() {
      return this.session("oauth.token");
    }
    // Stores the access token in the session.
    this.setAccessToken = function(token) {
      this.session("oauth.token", token);
      this.trigger("oauth.connected");
    }
    // Lose access token: use this to sign out.
    this.loseAccessToken = function() {
      this.session("oauth.token", null);
      this.trigger("oauth.disconnected");
    }

    // Add OAuth 2.0 access token to all XHR requests.
    $(document).ajaxSend(function(evt, xhr) {
      var token = app.getAccessToken();
      if (token)
        xhr.setRequestHeader("Authorization", "OAuth " + token);
    });

    // Converts query string parameters in fragment identifier to object.
    function parseParams(hash) {
      var pairs = hash.substring(1).split("&"), params = {};
      for (var i in pairs) {
        var splat = pairs[i].split("=");
        params[splat[0]] = splat[1].replace(/\+/g, " ");
      }
      return params;
    }

    var start_url;
    // Capture the application's start URL, we'll need that later on for
    // redirection.
    this.bind("run", function(evt, params) {
      start_url = params.start_url || "#";
      if (this.app.getAccessToken())
        this.trigger("oauth.connected");
    });

    // Intercept OAuth authorization response with access token, stores it and
    // redirects to original URL, or application root.
    this.before(/^#(access_token=|[^\\].*\&access_token=)/, function(context) {
      var params = parseParams(context.path);
      this.app.setAccessToken(params.access_token);
      // When the filter redirected the original request, it passed the original
      // request's URL in the state parameter, which we get back after
      // authorization.
      context.redirect(params.state.length == 0 ? this.app.start_url : unescape(params.state));
      return false;
    }).get(/^#(access_token=|[^\\].*\&access_token=)/, function(context) { });

    // Intercept OAuth authorization response with error (typically access
    // denied).
    this.before(/^#(error=|[^\\].*\&error=)/, function(context) {
      var params = parseParams(context.path);
      var message = params.error_description || "Access denined";
      context.trigger("oauth.denied", { code: params.error, message: message });
      return false;
    }).get(/^#(error=|[^\\].*\&error=)/, function(context) { });

  }
})(jQuery);
