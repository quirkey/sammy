describe('Meld', function() {
  var context;

  beforeEach(function() {
    var app = new Sammy.Application(function() {
      this.raise_errors = false;
      this.element_selector = '#main';
      this.use(Sammy.Meld);
      this.get('#/', function() {});
    });

    context = new app.context_prototype(app, 'get', '#/test/:test', {test: 'hooray'});
  });

  it('does simple interpolation', function() {
    var template = "<div class='title'></div>";
        data = {'title': 'TEST'},
        expected = "<div class='title'>TEST</div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('interpolates one level deep', function() {
    var template = "<div class='post'><div class='title'></div></div>";
        data = {'post': {'title': 'TEST'}},
        expected = "<div class='post'><div class='title'>TEST</div></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('interpolates multiple keys', function() {
    var template = "<div class='post'></div><div class='title'></div>";
        data = {'post': 'my post', 'title': 'TEST'},
        expected = "<div class='post'>my post</div><div class='title'>TEST</div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('interpolates multiple nested keys', function() {
    var template = "<div class='post'><div class='title'></div><div class='author'></div></div>";
        data = {'post': {'title': 'TEST', 'author': 'AQ'}},
        expected = "<div class='post'><div class='title'>TEST</div><div class='author'>AQ</div></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('multiplies an array of tags', function() {
    var template = "<div class='post'><span class='tags'></span></div>";
        data = {'post': {'tags': ['one', 'two']}},
        expected = "<div class='post'><span class='tags'>one</span><span class='tags'>two</span></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('multiplies an array of objects', function() {
    var template = "<div class='post'><div class='authors'><h2 class='name'></h2><span class='twitter'></span></div></div>";
        data = {'post': {'authors': [{'name': 'AQ', 'twitter': 'aq'}, {'name':'Mike', 'twitter':'mrb_bk'}]}},
        expected = "<div class='post'><div class='authors'><h2 class='name'>AQ</h2><span class='twitter'>aq</span></div><div class='authors'><h2 class='name'>Mike</h2><span class='twitter'>mrb_bk</span></div></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('multiplies an array on a list item', function() {
    var template = "<div class='post'><ul class='tags'></ul></div>";
        data = {'post': {'tags': ['one', 'two']}},
        expected = "<div class='post'><ul class='tags'><li>one</li><li>two</li></ul></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('multiplies an array on a list item using the example list item', function() {
    var template = "<div class='post'><ol class='tags'><li class='tag'></li></ol></div>";
        data = {'post': {'tags': ['one', 'two']}},
        expected = "<div class='post'><ol class='tags'><li class='tag'>one</li><li class='tag'>two</li></ol></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('replaces attributes of elements as a fallback to class lookup', function() {
    var template = "<div class='post'><a class='name' href=''></a></div>",
        data = {'post': {'name': {'href': 'http://www.google.com', 'text': 'Link'}}},
        expected = "<div class='post'><a class='name' href='http://www.google.com'>Link</a></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('removes nodes if value is false', function() {
    var template = "<div class='post'><h2 class='name'></h2><span class='active'>Active</span></div>",
        data = {'post': {'name': "My Name", 'active': false}},
        expected = "<div class='post'><h2 class='name'>My Name</h2></div>";

    expect(context.meld(template, data)).to.have.sameHTMLAs(expected);
  });

  it('allows the setting of a selector function', function() {
    var template = "<div rel='post'><h2 rel='name'></h2></div>",
        data = {'post': {'name': "My Name"}},
        expected = "<div rel='post'><h2 rel='name'>My Name</h2></div>";

    expect(context.meld(template, data, {selector: function(k) {
      return "[rel='"+ k + "']";
    }})).to.have.sameHTMLAs(expected);
  });

  it('renders templates correctly', function(done) {
    var templates = 3;

    var getAndAssertTemplate = function(i) {
      var template, json, result;
      $.get('fixtures/meld/' + i + '.meld', function(t) {
        template = t;
        $.getJSON('fixtures/meld/' + i + '.json', function(j) {
          json = j;
          $.get('fixtures/meld/' + i + '.html', function(r) {
            expect(context.meld(template, json)).to.have.sameHTMLAs(r);
            if (i == templates) {
              done();
            } else {
              getAndAssertTemplate(i + 1);
            }
          });
        });
      });
    }

    getAndAssertTemplate(1);
  });
});
