// a mock Hoptoad
// @see http://hoptoadapp.com/javascripts/notifier.js for the real deal
window.Hoptoad = {
  errors: [],
  notify: function(error) {
    this.errors.push(error);
  }
};

describe('Hoptoad', function() {
  var app = null;

  beforeEach(function() {
    app = new Sammy.Application(function() {
      this.element_selector = '#main';
      this.raise_errors = false;
      this.use(Sammy.Hoptoad);
      this.get('#/', function() {
        this.trigger('done');
      });
    });

    app.run('#/');
  });

  afterEach(function() {
    window.location.href = '#/';
  });

  it('does not send an error to Hoptoad when none is thrown', function(done) {
    app.bind('done', function() {
      expect(window.Hoptoad.errors).to.be.empty();
      app.unload();
      done();
    });

    app.get('#/test', function() {
      this.redirect('#/');
    });

    window.location.href = '#/test';
  });

  it('sends an error to Hoptoad when one is thrown', function(done) {
    app.bind('error', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }

      expect(window.Hoptoad.errors).to.have.length(1);
      expect(window.Hoptoad.errors[0].message).to.match(/Communications error/);

      app.unload();
      done();
    });

    app.get('#/test', function() {
      throw new Error('Communications error.');
    });

    window.location.href = "#/test";
  });
});
