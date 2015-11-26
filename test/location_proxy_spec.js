describe('DefaultLocationProxy', function() {
  var app, proxy,
      has_native = ('onhashchange' in window),
      has_history = window.history && history.pushState;

  beforeEach(function() {
    window.location.hash = '';
    app = new Sammy.Application(function() {
      this.element_selector = '#main';
      this.get('#/', function() {});
    });
    proxy = app._location_proxy;
  });

  it('stores a pointer to the app', function() {
    expect(proxy.app).to.eql(app);
  });

  if(!has_native) {
    it('sets is_native true if onhashchange exists in window');

    it('sets is_native to false if onhashchange does not exist in window', function() {
      var proxy2 = new Sammy.DefaultLocationProxy(app);
      proxy2.bind();
      window.location.hash = '#/testing';
      expect(proxy2.is_native).to.be(false);
      window.location.hash = '';
      proxy2.unbind();
    });

    it('creates poller on hash change', function() {
      expect(Sammy.DefaultLocationProxy._interval).to.be.a('number');
    });

    it('only creates a single poller', function() {
      var interval = Sammy.DefaultLocationProxy._interval;
      new Sammy.DefaultLocationProxy(app);
      expect(Sammy.DefaultLocationProxy._interval).to.eql(interval);
    });

    it('creates a new poller if unbind was called on location proxy', function() {
      var interval = Sammy.DefaultLocationProxy._interval;
      proxy.unbind();
      new Sammy.DefaultLocationProxy(app);
      expect(Sammy.DefaultLocationProxy._interval).not.to.eql(interval);
    });
  } else {
    it('sets is_native true if onhashchange exists in window', function(done) {
      $('#main').html('');
      var i = 0;

      window.location.hash = '#/';

      app.bind('location-changed', function() {
        if(i === 0) {
          window.location.hash = '#/abc';
          i += 1;
        } else {
          expect(proxy.is_native).to.be(true);
          app.unload();
          window.location.hash = '#/';
          done();
        }
      });

      app.get('#/abc', function() {});
      app.run('#/');
    });

    it('sets is_native to false if onhashchange does not exist in window');
    it('creates poller on hash change');
    it('only creates a single poller');
    it('creates a new poller if unbind was called on location proxy');
  }

  it('returns the full path for the location', function() {
    hash = window.location.hash;
    if(hash === '#') { hash = ''; } // IE returns '#' instead of '' when the hash is empty
    expect(proxy.getLocation()).to.eql([window.location.pathname, window.location.search, hash].join(''));
  });

  if(has_history) {
    it('pushes and pops state if History is available', function(done) {
      var originalLocation, i = 0;

      app.bind('location-changed', function() {
        if(i === 0) {
          i += 1;
          expect(proxy.getLocation()).to.eql('/testing');
          app.setLocation(originalLocation);
        } else {
          expect(proxy.getLocation()).to.eql(originalLocation);
          app.unload();
          done();
        }
      });

      app.run('#/');
      expect(app.isRunning()).to.be(true);

      originalLocation = proxy.getLocation();
      app.setLocation('/testing');
    });

    it('binds to push state links', function(done) {
      var locations = [], originalLocation, i = 0;

      app.bind('location-changed', function() {
        if(i === 0) {
          expect(proxy.getLocation()).to.eql('/push');
          i += 1;
          $('#pop').click();
        } else if(i === 1) {
          expect(proxy.getLocation()).to.eql('/pop');
          i += 1;
          proxy.setLocation(originalLocation);
        } else {
          expect(proxy.getLocation()).to.eql(originalLocation);
          app.unload();
          done();
        }
      });

      $('#main').html('<a id="pop" href="/pop">test</a>' +
        '<a id="push" href="/push">test</a>');

      app.get('/push', function() {});
      app.get('/pop', function() {});

      app.run('#/');
      expect(app.isRunning()).to.be(true);

      var originalLocation = proxy.getLocation();
      $('#push').click();
    });

    it('empty link hostname does not break push state links', function (done) {
      var link = $('<a href="/push">test</a>');

      app.bind('location-changed', function () {
        expect(proxy.getLocation()).to.eql('/push');
        app.unload();
        done();
      });

      $('#main').append(link);

      // Browsers do not allow clearing hostname by JS without affecting 
      // the href property. Therefore this test is meaningful on IE only, 
      // as the following line clears the hostname property on IE.
      link.get(0).setAttribute('href', '/push');
      
      app.get('/push', function () { });

      app.run('#/');
      expect(app.isRunning()).to.be(true);

      link.click();
    });
  } else {
    it('pushes and pops state if History is available');
    it('binds to push state links');
    it('empty link hostname does not break push state links');
  }

  it('handles arbitrary non-specific locations', function(done) {
    var i = 0;

    app.bind('location-changed', function() {
      if(i === 0) {
        i += 1;
        proxy.setLocation('testing');
      } else if(i === 1) {
        i += 1;
        if (has_history) {
          expect(proxy.getLocation()).to.eql('/testing');
        } else {
          expect(proxy.getLocation()).to.eql('/#!/testing');
        }
        proxy.setLocation('');
      } else if(i === 2) {
        if (has_history) {
          expect(proxy.getLocation()).to.eql('/');
        } else {
          expect(proxy.getLocation()).to.eql('/#!/');
        }
        app.unload();
        window.location.href = '#/';
        done();
      }
    });

    app.get('/testing', function() {});
    app.get('/', function() {});

    app.run('#/');
    expect(app.isRunning()).to.be(true);
  });
});

describe('DataLocationProxy', function() {
  var app;

  beforeEach(function() {
    app = new Sammy.Application(function() {
      this.setLocationProxy(new Sammy.DataLocationProxy(this));
      this.get('#/', function() {});
    });
  });

  it('stores a pointer to the app', function() {
    expect(app._location_proxy.app).to.eql(app);
  });

  it('can configure the data name', function() {
    var proxy = new Sammy.DataLocationProxy(app, 'othername');
    proxy.setLocation('newlocation');
    expect($('body').data('othername')).to.eql('newlocation');
  });

  it('returns the current location from the data', function() {
    $('body').data(app._location_proxy.data_name, '#/zuh');
    expect(app._location_proxy.getLocation()).to.eql('#/zuh');
  });

  it('sets the current location in the data', function() {
    $('body').data(app._location_proxy.data_name, '#/zuh')
    app._location_proxy.setLocation('#/boosh');
    expect(app._location_proxy.getLocation()).to.eql('#/boosh');
  });

  it('returns an empty string when there is no location stored in the data', function() {
    $.removeData($('body')[0], app._location_proxy.data_name);
    expect($('body').data(app._location_proxy.data_name)).to.be(undefined);
    expect(app._location_proxy.getLocation()).to.eql('');
  });

  it('triggers an app event when data changes', function(done) {
    $('body').data(app._location_proxy.data_name, '');

    app.get('#/newhash', function() {});
    app.bind('location-changed', function() {
      expect(app.getLocation()).to.eql('#/newhash');
      window.location.hash = '#/';
      app.unload();
      done();
    });

    app.run('#/');

    $('body').data(app._location_proxy.data_name, '#/newhash');
  });
});
