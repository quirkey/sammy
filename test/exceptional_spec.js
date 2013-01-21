// a mock Exceptional
// @see https://github.com/contrast/exceptional-js/blob/master/public/exceptional.js for the real deal
window.Exceptional = {
  errors: [],
  handle: function(msg, url, line) {
    this.errors.push({
      message: msg,
      url:     url,
      line:    line
    });
  }
};

describe('Exceptional', function() {
  var app;

  beforeEach(function() {
    $('#main').html('<form id="myform" method="post" action="#/handle_my_form"></form>');
    app = new Sammy.Application(function() {
      this.element_selector = '#main';
      this.raise_errors = false;
      this.use(Sammy.Exceptional);
      this.get('#/', function() {
        this.trigger('done');
      });
    });
    app.run('#/');
  });

  it('does not send an error to Exceptional when none is thrown', function(done) {
    app.bind('done', function() {
      expect(window.Exceptional.errors).to.be.empty();
      app.unload();
      done();
    });
    app.post('#/handle_my_form', function() {
      this.redirect('#/');
    });
    $('#myform').submit();
  });

  it('sends an error to Exceptional if one is thrown', function(done) {
    app.bind('error', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }

      expect(window.Exceptional.errors).to.have.length(1);
      expect(window.Exceptional.errors[0].message).to.match(/Communications error/);
      expect(window.Exceptional.errors[0].url).to.match(new RegExp(window.location.href));

      app.unload();
      done();
    });

    app.post('#/handle_my_form', function() {
      throw new Error('Communications error.');
    });

    $('#myform').submit();
  });
});
