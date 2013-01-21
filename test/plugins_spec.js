describe('Plugins', function() {
  var app, context, alias_app, alias_context;

  describe('Cache', function() {
    var other_app;

    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.element_selector = '#main';
        this.use(Sammy.Cache);
        this.clearCache();
        this.cache('mycache', 'my value');
        this.cache('mynumcache', 3);
      });
      other_app = new Sammy.Application(function() {
        this.element_selector = '#main2';
        this.use(Sammy.Cache);
        this.clearCache();
        this.cache('mycache', 'not my value');
        this.cache('mynumcache', 7);
      });
    });

    it('retrieves values by passing name', function() {
      expect(app.cache('mycache')).to.eql('my value');
      expect(other_app.cache('mycache')).to.eql('not my value');
      expect(app.cache('mynumcache')).to.eql(3);
      expect(other_app.cache('mynumcache')).to.eql(7);
    });

    it('sets values by passing a value', function() {
      app.cache('mycache', 'my new value');
      expect(app.cache('mycache')).to.eql('my new value');
    });

    it('runs callbacks only if value is not set', function() {
      var inner_context = null;
      var was_run = false;

      app.cache('mycache', function() {
        was_run = true;
        return 'new value';
      });
      expect(was_run).to.be(false);
      expect(inner_context).to.be(null);

      app.cache('mynewcache', function() {
        was_run = true;
        inner_context = this;
        return 'new value';
      });
      expect(was_run).to.be(true);
      expect(inner_context).to.eql(app);
      expect(app.cache('mynewcache')).to.eql('new value');
    });

    it('clear specific cache values', function() {
      app.clearCache('mycache');
      expect(app.cache('mycache')).to.be(undefined);
    });
  });

  describe('Template', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Template);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.Template, 'tpl');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a template helper to the event context', function() {
      expect(context.template).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.template('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT!</div>');
    });

    it('sets the context of the template to the test_context', function() {
      context.blurgh = 'boosh';
      var rendered = context.template('<div class="test_class"><%= text %> <%= blurgh %></div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT! boosh</div>');
    });

    it('renders templates with a lot of single quotes', function() {
      var rendered = context.template("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
      expect(rendered).to.eql("<div class='test_class' id='test'>I'm TEXT!</div>");
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.template).to.be(undefined);
      expect(alias_context.tpl).to.be.a(Function);
      expect(alias_context.tpl.toString()).to.match(/srender/);
    });
  });

  describe('EJS', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.EJS);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.EJS, 'ejs');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a template helper to the event context', function() {
      expect(context.ejs).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.ejs('<div class="test_class"><%= text %></div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT!</div>');
    });

    it('renders templates with a lot of single quotes', function() {
      var rendered = context.ejs("<div class='test_class' id='test'>I'm <%= text %></div>", {text: 'TEXT!'});
      expect(rendered).to.eql("<div class='test_class' id='test'>I'm TEXT!</div>");
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.template).to.be(undefined);
      expect(alias_context.ejs).to.be.a(Function);
      expect(alias_context.ejs.toString()).to.match(/render/);
    });
  });

  describe('NestedParams', function() {
    describe('valid fields', function() {
      beforeEach(function() {
        $('#main').html(
          '<div id="form_params" style="display:none;">' +
          '  <form id="nested_params_test_form" action="#/test_nested_params" method="post">' +
          '    <input type="text" name="author" value="Wilde" />' +
          '    <input type="text" name="author" value="Thoreau" />' +
          '    <input type="text" name="title" value="Walden%21" />' +
          '    <input type="text" name="genre[]" value="documentary" />' +
          '    <input type="text" name="genre[]" value="nature" />' +
          '    <input type="checkbox" name="truevalue" value="true" checked="checked" />' +
          '    <input type="checkbox" name="falsevalue" value="false" checked="checked" />' +
          '    <input type="text" name="woods[trees][][name]" value="Spruce" />' +
          '    <input type="text" name="woods[trees][][name]" value="Maple" />' +
          '    <input type="text" name="poll[name]" value="Which beverage do you like best?" />' +
          '    <input type="text" name="poll[priority]" value="10" />' +
          '    <input type="hidden" name="poll[options][1][id]" value="Ko5Pi" />' +
          '    <input type="text" name="poll[options][1][name]" value="Coffee" />' +
          '    <input type="hidden" name="poll[options][2][id]" value="Oaj5N" />' +
          '    <input type="text" name="poll[options][2][name]" value="Tea" />' +
          '    <input type="text" name="poll[options][1][ingredients][]" value="Water" />' +
          '    <input type="text" name="poll[options][1][ingredients][]" value="Coffein" />' +
          '    <input type="text" name="pages[][words][]" value="Woods" />' +
          '    <input type="text" name="pages[][words][]" value="Money" />' +
          '    <input type="text" name="music[instruments][][name]" value="Piano" />' +
          '    <input type="text" name="music[instruments][][size]" value="big" />' +
          '    <input type="text" name="music[instruments][][name]" value="Flute" />' +
          '    <input type="text" name="music[instruments][][size]" value="small" />' +
          '  </form>' +
          '</div>'
        );

        app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.use(Sammy.NestedParams);
          this.get('#/', function() {});
        });
      });

      it('parses a twice submitted value', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['author']).to.eql('Thoreau');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses true and false values as true and false literals', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['falsevalue']).to.be(false);
          expect(this.params['truevalue']).to.be(true);
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses basic arrays', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['genre'][0]).to.eql('documentary');
          expect(this.params['genre'][1]).to.eql('nature');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses basic hashes', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['poll']['name']).to.eql('Which beverage do you like best?');
          expect(this.params['poll']['priority']).to.eql('10');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses nested hashes', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['poll']['options']['1']['id']).to.eql('Ko5Pi');
          expect(this.params['poll']['options']['1']['name']).to.eql('Coffee');
          expect(this.params['poll']['options']['2']['id']).to.eql('Oaj5N');
          expect(this.params['poll']['options']['2']['name']).to.eql('Tea');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses arrays in nested hashes', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['poll']['options']['1']['ingredients'][0]).to.eql('Water');
          expect(this.params['poll']['options']['1']['ingredients'][1]).to.eql('Coffein');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses hashes in nested arrays in nested hashes', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['woods']['trees'][0]['name']).to.eql('Spruce');
          expect(this.params['woods']['trees'][1]['name']).to.eql('Maple');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses arrays in nested hashes in nested arrays', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['pages'][0]['words'][0]).to.eql('Woods');
          expect(this.params['pages'][1]['words'][0]).to.eql('Money');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses complex hashes in nested arrays in nested hashes', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['music']['instruments'][0]['name']).to.eql('Piano');
          expect(this.params['music']['instruments'][0]['size']).to.eql('big');
          expect(this.params['music']['instruments'][1]['name']).to.eql('Flute');
          expect(this.params['music']['instruments'][1]['size']).to.eql('small');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('unescapes the escaped params', function(done) {
        app.post(/test_nested_params/, function() {
          expect(this.params['title']).to.eql('Walden!');
          app.unload();
          done();
        });

        app.run('#/');
        $('#nested_params_test_form').submit();
      });

      it('parses the query string', function(done) {
        app.get('#/get_form', function() {
          expect(this.params['genre'][0]).to.eql('documentary');
          expect(this.params['genre'][1]).to.eql('nature');
          window.location.href = '#/';
          app.unload();
          done();
        });

        app.run('#/');
        window.location.href = '#/get_form?genre%5B%5D=documentary&genre%5B%5D=nature'
      });
    });

    describe('invalid fields', function() {
      beforeEach(function() {
        $('#main').html(
          '<form id="bad_nested_params_form" action="#/bad_nested_params" method="post">' +
          '  <!-- these produce bad request errors -->' +
          '  <input type="text" name="woods[trees][]name" value="Oak" />' +
          '  <input type="text" name="softdrinks[]" value="Pepsi" />' +
          '  <input type="text" name="softdrinks[name]" value="Cola" />' +
          '  <input type="text" name="beverages[wine]" value="Cuvee du Vatican" />' +
          '  <input type="text" name="beverages[wine][][name]" value="Fleurie" />' +
          '</form>'
        );

        app = new Sammy.Application(function() {
          this.element_selector = '#main';
          this.use(Sammy.NestedParams);
        });
      });

      it('raises an error for bad params', function(done) {
        disableTrigger(app, function() {
          expect(function() {
            app._parseFormParams($('#bad_nested_params_form'));
          }).to.throwException(/400/);
        }, done);
      });
    });
  });

  describe('Mustache', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Mustache);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.Mustache, 'ms');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a mustache helper to the event context', function() {
      expect(context.mustache).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.mustache('<div class="test_class">{{text}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT!</div>');
    });

    it('sets the context of the template to the test_context', function() {
      context.blurgh = 'boosh';
      var rendered = context.mustache('<div class="test_class">{{text}} {{blurgh}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT! boosh</div>');
    });

    it('allows mustache partials by passing partials to data', function() {
      var data = {blurgh: 'boosh', partials: {first: 'a {{what}}'}, first: {what: 'partial'}};
      var rendered = context.mustache('<div class="test_class">{{>first}} {{blurgh}}</div>', data);
      expect(rendered).to.eql('<div class="test_class">a partial boosh</div>');
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.mustache).to.be(undefined);
      expect(alias_context.ms).to.be.a(Function);
      expect(alias_context.ms.toString()).to.match(/Mustache/);
    });
  });

  describe('Hogan', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Hogan);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.Hogan, 'hg');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a mustache helper to the event context', function() {
      expect(context.hogan).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.hogan('<div class="test_class">{{text}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT!</div>');
    });

    it('sets the context of the template to the test_context', function() {
      context.blurgh = 'boosh';
      var rendered = context.hogan('<div class="test_class">{{text}} {{blurgh}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT! boosh</div>');
    });

    it('allows hogan partials by passing partials to data', function() {
      var data = {blurgh: 'boosh', partials: {first: 'a {{what}}'}, first: { what: 'partial'}};
      var rendered = context.hogan('<div class="test_class">{{#first}}{{>first}}{{/first}} {{blurgh}}</div>', data);
      expect(rendered).to.eql('<div class="test_class">a partial boosh</div>');
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.hogan).to.be(undefined);
      expect(alias_context.hg).to.be.a(Function);
      expect(alias_context.hg.toString()).to.match(/Hogan/);
    });
  });

  describe('Handlebars', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Handlebars);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.Handlebars, 'hb');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a mustache helper to the event context', function() {
      expect(context.handlebars).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.handlebars('<div class="test_class">{{text}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT!</div>');
    });

    it('sets the context of the template to the test_context', function() {
      context.blurgh = 'boosh';
      var rendered = context.handlebars('<div class="test_class">{{text}} {{blurgh}}</div>', {text: 'TEXT!'});
      expect(rendered).to.eql('<div class="test_class">TEXT! boosh</div>');
    });

    it('allows handlebars partials by passing partials to data', function() {
      var data = {blurgh: 'boosh', partials: {first: 'a {{what}}'}, what: 'partial'};
      var rendered = context.handlebars('<div class="test_class">{{>first}} {{blurgh}}</div>', data);
      expect(rendered).to.eql('<div class="test_class">a partial boosh</div>');
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.handlebars).to.be(undefined);
      expect(alias_context.hb).to.be.a(Function);
      expect(alias_context.hb.toString()).to.match(/Handlebars/);
    });
  });

  describe('jQuery-tmpl', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Tmpl);
      });
      context = new app.context_prototype(app, 'get', '#/', {});

      alias_app = new Sammy.Application(function() {
        this.use(Sammy.Tmpl, 'jqt');
      });
      alias_context = new alias_app.context_prototype(alias_app, 'get', '#/', {});
    });

    it('adds a mustache helper to the event context', function() {
      expect(context.tmpl).to.be.a(Function);
    });

    it('interpolates content', function() {
      var rendered = context.tmpl('<div class="test_class">${text}</div>', {text: 'TEXT!'});
      expect(rendered).to.have.sameHTMLAs('<div class="test_class">TEXT!</div>');
    });

    it('sets the context of the template to the test_context', function() {
      context.blurgh = 'boosh';
      var rendered = context.tmpl('<div class="test_class">${text} ${blurgh}</div>', {text: 'TEXT!'});
      expect(rendered).to.have.sameHTMLAs('<div class="test_class">TEXT! boosh</div>');
    });

    it('allows tmpl partials by passing partials to data', function() {
      var data = {blurgh: 'fizzzz', partials: {first: 'a ${what}'}, what: 'partial'};
      var rendered = context.tmpl('<div class="test_class">{{tmpl "first"}} ${blurgh}</div>', data);
      expect(rendered).to.have.sameHTMLAs('<div class="test_class">a partial fizzzz</div>');
    });

    it('aliases the template method and thus the extension', function() {
      expect(alias_context.tmpl).to.be(undefined);
      expect(alias_context.jqt).to.be.a(Function);
      expect(alias_context.jqt.toString()).to.match(/jQuery.tmpl/);
    });
  });

  describe('JSON', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.JSON);
      });
      context = new app.context_prototype(app, 'get', '#/', {});
    });

    it('adds a json helper to the event context', function() {
      expect(context.json).to.be.a(Function);
    });

    it('ensures JSON is in the global namespace', function() {
      expect(JSON.parse).to.be.a(Function);
      expect(JSON.stringify).to.be.a(Function);
    });

    it('parses JSON if object is a string', function() {
      expect(context.json("{\"test\":\"123\"}").test).to.eql("123");
    });

    it('stringifies JSON if object is an object', function() {
      expect(context.json({test: "123"})).to.eql("{\"test\":\"123\"}");
    });
  });

  describe('Haml', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Haml);
      });
      context = new app.context_prototype(app, 'get', '#/', {});
    });

    it('adds a haml helper to the event context', function() {
      expect(context.haml).to.be.a(Function);
    });

    it('uses haml-js to render haml templates', function() {
      var template = ".mytemplate= title";
      expect(context.haml(template, {title: "HAML!!"})).to.eql("<div class=\"mytemplate\">HAML!!</div>");
    });
  });

  describe('PURE', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.use(Sammy.Pure);
      });
      context = new app.context_prototype(app, 'get', '#/', {});
    });

    it('adds a pure helper to the event context', function() {
      expect(context.pure).to.be.a(Function);
    });

    it('uses pure to render haml templates', function() {
      var template = "<div class='title'></div>";
      expect(context.pure(template, {title: "PURE!!"})).to.have.sameHTMLAs("<div class=\"title\">PURE!!</div>");
    });
  });

  describe('Form', function() {
    var item;

    describe('#simple_element()', function() {
      beforeEach(function() {
        app = new Sammy.Application(function() {
          this.use(Sammy.Form);
        });
        context = new app.context_prototype(app, 'get', '#/', {});
        item = {
          name: 'Test Item'
        };
      });

      it('returns a simple string element with simple_element', function() {
        expect(context.simple_element('div', {'class': 'test'}, "test")).to.eql("<div class='test'>test</div>");
      });

      it('creates a self closing if no content is passed', function() {
        expect(context.simple_element('div', {'class': 'test'})).to.eql("<div class='test' />");
      });

      it('evaluates attributes that are functions', function() {
        expect(context.simple_element('div', {id: function() { return 'test'; }})).to.eql("<div id='test' />");
      });
    });

    describe('FormBuilder', function() {
      var builder;

      beforeEach(function() {
        app = new Sammy.Application(function() {
          this.use(Sammy.Form);
          this.use(Sammy.Template);
        });
        context = new app.context_prototype(app, 'get', '#/', {});

        // test item
        item = {
          id: "1234",
          name: 'Item Name',
          price: '$10.00',
          quantity: 5,
          description: "This is a long\ndescription",
          color: function() {
            return 'red';
          },
          meta: {
            url: 'http://www.quirkey.com'
          },
          is_private: false,
          related: [
            {name: 'Related 1'},
            {name: 'Related 2'}
          ]
        };
        builder = new Sammy.FormBuilder('item', item);
      });

      it('creates a form builder with name and object', function() {
        expect(builder.name).to.eql('item');
        expect(builder.object).to.eql(item);
      });

      it('returns a text field for attributes with a simple keypath', function() {
        var expected = "<input type='text' name='item[name]' value='Item Name' class='item-name' />";
        expect(builder.text('name')).to.eql(expected);
      });

      it('returns a text field with additional attributes', function() {
        var expected = "<input type='text' name='item[name]' value='Item Name' class='item-name' rel='test' />";
        expect(builder.text('name', {rel: 'test'})).to.eql(expected);
      });

      it('returns a text field when the attribute does not exist', function() {
        var expected = "<input type='text' name='item[none]' value='' class='item-none' />";
        expect(builder.text('none')).to.eql(expected);
      });

      it('returns a text field for an attribute with a deep keypath', function() {
        var expected = "<input type='text' name='item[meta][url]' value='http://www.quirkey.com' class='item-meta-url' />";
        expect(builder.text('meta.url')).to.eql(expected);
        expect(builder.text(['meta', 'url'])).to.eql(expected);
      });

      it('returns a text field for an attribute with an array keypath', function() {
        var expected = "<input type='text' name='item[related][0][name]' value='Related 1' class='item-related-0-name' />";
        expect(builder.text('related.0.name')).to.eql(expected);
      });

      it('returns a select tag with options and selection', function() {
        var expected = "<select name='item[color]' class='item-color'><option value='blue'>blue</option><option value='red' selected='selected'>red</option><option value='green'>green</option></select>";
        expect(builder.select('color', ['blue', 'red', 'green'])).to.eql(expected);
      });

      it('returns a label with key as for', function() {
        var expected = "<label for='item[name]'>Name</label>";
        expect(builder.label('name', 'Name')).to.eql(expected);
      });

      it('returns a hidden input', function() {
        var expected = "<input type='hidden' name='item[id]' value='1234' class='item-id' />";
        expect(builder.hidden('id')).to.eql(expected);
      });

      it('returns a textarea', function() {
        var expected = "<textarea name='item[description]' class='item-description'>This is a long\ndescription</textarea>";
        expect(builder.textarea('description')).to.eql(expected);
      });

      it('returns a checkbox', function() {
        var expected = "<input type='hidden' name='item[is_private]' value='false' class='item-is_private' /><input type='checkbox' name='item[is_private]' value='true' class='item-is_private' />";
        expect(builder.checkbox('is_private', true)).to.eql(expected);

        item.is_private = true;
        expected = "<input type='hidden' name='item[is_private]' value='false' class='item-is_private' /><input type='checkbox' name='item[is_private]' value='true' class='item-is_private' checked='checked' />";
        expect(builder.checkbox('is_private', true)).to.eql(expected);
      });

      it('returns a checkbox with no hidden element', function() {
        var expected = "<input type='checkbox' name='item[is_private]' value='true' class='item-is_private' />";
        expect(builder.checkbox('is_private', true, {hidden_element: false})).to.eql(expected);

        item.is_private = true;
        expected = "<input type='checkbox' name='item[is_private]' value='true' class='item-is_private' checked='checked' />";
        expect(builder.checkbox('is_private', true, {hidden_element: false})).to.eql(expected);
      });

      it('returns a radio button', function() {
        var expected = "<input type='radio' name='item[quantity]' value='5' class='item-quantity' checked='checked' />";
        expect(builder.radio('quantity', 5)).to.eql(expected);
      });

      it('builds a form with form in a template', function() {
        var template = "<% formFor('item', function(f) { %>" +
                       "<%= f.open() %>" +
                       "<p><label>Name:</label><%= f.text('name') %></p>" +
                       "<%= f.close() %>" +
                       "<% }); %>";
        var rendered = "<form method='post' action='#/items'>" +
          "<p><label>Name:</label>" +
          "<input type='text' name='item[name]' value='Item Name' class='item-name' />" +
          "</p></form>";

        context.item = item;
        expect(context.template(template, {}, {escape_html: false})).to.eql(rendered);
      });
    });
  });

  describe('oAuth', function() {
    beforeEach(function() {
      app = new Sammy.Application(function() {
        this.element_selector = '#main';
        this.use(Sammy.Session);
        this.use(Sammy.OAuth2);
        this.loseAccessToken(); // Clear from previous run
        this.authorize = '#/oauth/authorize-me';
        this.requireOAuth('#/private');
        this.get('/', function() {});
        this.get('#/private', function() {});
        this.get('#/oauth/authorize-me', function() {});
        this.get('#/signout', function(context) {
          context.loseAccessToken();
        });
      });
    });

    afterEach(function() {
      window.location.hash = '/';
    });

    it('requests authorization if there is no token', function(done) {
      app.bind('location-changed', evaluateSecondCall(function() {
        var expected = '#/oauth/authorize-me?state=/#/private';
        expect(decodeURIComponent(window.location.hash)).to.eql(expected);
        app.unload();
        done();
      }));

      app.run('/');
      window.location.href = '#/private';
    });

    it('captures the access token from a successful authorization', function(done) {
      app.bind('location-changed', evaluateSecondCall(function() {
        expect(app.getAccessToken()).to.eql('5678');
        app.unload();
        done();
      }));

      app.run('/');
      window.location.href = '#access_token=5678&state=%23';
    });

    it('redirects to the original URL after a successful authorization', function(done) {
      app.bind('location-changed', evaluateSecondCall(function() {
        expect(window.location.hash).to.eql('#/private');
        app.unload();
        done();
      }));

      app.run('/');
      window.location.href = '#state=%23/private&access_token=5678';
    });

    it('triggers an oauth.error event if authorization denied', function(done) {
      app.bind('oauth.denied', function(evt, error) {
        expect(error.code).to.eql('access_denied');
        expect(error.message).to.eql("Access Denied");
        app.unload();
        done();
      });

      app.run('/');
      window.location.href = '#error=access_denied&error_description=Access+Denied';
    });

    it('loses access token from helper method', function(done) {
      app.bind('oauth.disconnected', function() {
        expect(app.getAccessToken()).to.be(null);
        app.unload();
        done();
      });

      app.run('/');
      app.setAccessToken('5678');
      expect(app.getAccessToken()).to.eql('5678');
      window.location.href = '#/signout';
    });

    it('passes to route if token is available', function(done) {
      app.requireOAuth('#/test');
      app.get('#/test', function() {
        app.unload();
        done();
      });

      app.run('/');
      app.setAccessToken('5678');
      window.location.href = '#/test';
    });

    it('triggers oauth.connected when connected', function(done) {
      app.bind('oauth.connected', function() {
        app.unload();
        done();
      });
      app.run('/');
      window.location.href = '#access_token=5678&state=%23';
    });

    it('triggers oauth.connected if started with an access token', function(done) {
      var connected = false;

      app.bind('oauth.connected', function() {
        connected = true;
      });

      app.bind('changed', function() {
        expect(connected).to.be(true);
        app.unload();
        done();
      });

      app.setAccessToken('5678');
      app.run('/');
    });

    it('does not trigger oauth.connected if started without an access token', function(done) {
      var connected;
      app.bind('oauth.connected', function() { connected = true });
      app.run('/');
      setTimeout(function() {
        expect(connected).to.be(undefined);
        app.unload();
        done();
      }, 200);
    });

    it('passes OAuth in header when making an XHR request', function(done) {
      var i = 0;

      app.run('/');
      app.setAccessToken('5678');
      xhr = {setRequestHeader: function(name, value) {
         if(i == 0) {
           expect(name).to.eql('Authorization');
           expect(value).to.eql('OAuth 5678');
           app.unload();
           done();
         }

         i += 1;
      }};
      $(document).trigger('ajaxSend', xhr);
    });
  });
});
