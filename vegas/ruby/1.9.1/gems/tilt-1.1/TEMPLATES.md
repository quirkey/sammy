Tilt Templates
==============

While all Tilt templates use the same basic interface for template loading and
evaluation, each varies in its capabilities and available options. Detailed
documentation on each supported template engine is provided below.

 * [ERB](#erb) - `Tilt::ERBTemplate`
 * [Erubis](#erubis) - `Tilt::ErubisTemplate`
 * [Haml](#haml) - `Tilt::HamlTemplate`
 * [Liquid](#liquid) - `Tilt::LiquidTemplate`

Tilt includes support for CSS processors like [lesscss](http://lesscss.org)
and [sass](http://sass-lang.com/), in addition, it also supports simple
text formats.

 * Less - `Tilt::LessTemplate`
 * Sass - `Tilt::SassTemplate`
 * [Markdown](#markdown) - `Tilt::RDiscountTemplate`
 * [RDoc](#rdoc) - `Tilt::RDocTemplate`

<a name='erb'></a>
ERB (`erb`, `rhtml`)
--------------------

An easy to use but powerful templating system for Ruby.

### Example

    Hello <%= world %>!

### Usage

The `Tilt::ERBTemplate` class is registered for all files ending in `.erb` or
`.rhtml` by default. ERB templates support custom evaluation scopes and locals:

    >> require 'erb'
    >> template = Tilt.new('hello.html.erb', :trim => '<>')
    => #<Tilt::ERBTemplate @file='hello.html.erb'>
    >> template.render(self, :world => 'World!')
    => "Hello World!"

Or, use the `Tilt::ERBTemplate` class directly to process strings:

    require 'erb'
    template = Tilt::ERBTemplate.new(nil, :trim => '<>') { "Hello <%= world %>!" }
    template.render(self, :world => 'World!')

__NOTE:__ It's suggested that your program `require 'erb'` at load time when
using this template engine within a threaded environment.

### Options

#### `:trim => '-'`

The ERB trim mode flags. This is a string consisting
of any combination of the following characters:

  * `'>'`  omits newlines for lines ending in `>`
  * `'<>'` omits newlines for lines starting with `<%` and ending in `%>`
  * `'-'`  omits newlines for lines ending in `-%>`.
  * `'%'`  enables processing of lines beginning with `%`

#### `:safe => nil`

The `$SAFE` level; when set, ERB code will be run in a
separate thread with `$SAFE` set to the provided level.

#### `:outvar => '_erbout'`

The name of the variable used to accumulate template output. This can be
any valid Ruby expression but must be assignable. By default a local
variable named `_erbout` is used.

### See also

  * [ERB documentation](http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/classes/ERB.html)


<a name='erubis'></a>
Erubis (`erubis`)
-----------------

Erubis is a fast, secure, and very extensible implementation of eRuby.

### Usage

To use Erubis instead of ERB for all `.erb` and `.rhtml` files, register
the extensions as follows:

    Tilt.register 'erb', Tilt::ErubisTemplate
    Tilt.register 'rhtml', Tilt::ErubisTemplate

### Options

#### `:engine_class => Erubis::Eruby`

Allows you to specify a custom engine class to use instead of the
default which is `Erubis::Eruby`.

#### `:escape_html => false`

When `true`, `Erubis::EscapedEruby` will be used as the engine class
instead of the default. All content within `<%= %>` blocks will be
automatically html escaped.

#### `:outvar => '_erbout'`

The name of the variable used to accumulate template output. This can be
any valid Ruby expression but must be assignable. By default a local
variable named `_erbout` is used.

#### `:pattern => '<% %>'`

Set pattern for embedded Ruby code.

See the [ERB](#erb) template documentation for examples, usage, and options.

#### `:trim => true`

Delete spaces around '<% %>'. (But, spaces around '<%= %>' are preserved.)

### See also

  * [Erubis Home](http://www.kuwata-lab.com/erubis/)
  * [Erubis User's Guide](http://www.kuwata-lab.com/erubis/users-guide.html)

__NOTE:__ It's suggested that your program `require 'erubis'` at load time when
using this template engine within a threaded environment.

<a name='haml'></a>
Haml (`haml`)
-------------

Haml is a markup language that’s used to cleanly and simply describe the HTML of
any web document without the use of inline code. Haml functions as a replacement
for inline page templating systems such as PHP, ASP, and ERB, the templating
language used in most Ruby on Rails applications. However, Haml avoids the
need for explicitly coding HTML into the template, because it itself is a
description of the HTML, with some code to generate dynamic content.
([more](http://haml-lang.com/about.html))


### Example

    %html
      %head
        %title= @title
      %body
        %h1
          Hello
          = world + '!'

### Usage

The `Tilt::HamlTemplate` class is registered for all files ending in `.haml`
by default. Haml templates support custom evaluation scopes and locals:

    >> require 'haml'
    >> template = Tilt.new('hello.haml')
    => #<Tilt::HamlTemplate @file='hello.haml'>
    >> @title = "Hello Haml!"
    >> template.render(self, :world => 'Haml!')
    => "
    <html>
      <head>
        <title>Hello Haml!</title>
      </head>
      <body>
        <h1>Hello Haml!</h1>
      </body>
    </html>"

Or, use the `Tilt::HamlTemplate` class directly to process strings:

    >> require 'haml'
    >> template = Tilt::HamlTemplate.new { "%h1= 'Hello Haml!'" }
    => #<Tilt::HamlTemplate @file=nil ...>
    >> template.render
    => "<h1>Hello Haml!</h1>"

__NOTE:__ It's suggested that your program `require 'haml'` at load time when
using this template engine within a threaded environment.

### Options

#### `:format => :xhtml`

Determines the output format. The default is `:xhtml`. Other options are
`:html4` and `:html5`, which are identical to `:xhtml` except there are no
self-closing tags, the XML prolog is ignored and correct DOCTYPEs are generated.

#### `:escape_html => false`

Sets whether or not to escape HTML-sensitive characters in script. If this is
true, `=` behaves like `&=;` otherwise, it behaves like `!=`. Note that if this
is set, `!=` should be used for yielding to subtemplates and rendering partials.
Defaults to false.

#### `:ugly => false`

If set to true, Haml makes no attempt to properly indent or format the HTML
output. This causes the rendering to be done much quicker than it would
otherwise, but makes viewing the source unpleasant. Defaults to false.

#### `:suppress_eval => false`

Whether or not attribute hashes and Ruby scripts designated by `=` or `~` should
be evaluated. If this is true, said scripts are rendered as empty strings.
Defaults to false.

#### `:attr_wrapper => "'"`

The character that should wrap element attributes. This defaults to `'` (an
apostrophe). Characters of this type within the attributes will be escaped (e.g.
by replacing them with `&apos;`) if the character is an apostrophe or a
quotation mark.

#### `:autoclose => %w[meta img link br hr input area param col base]`

A list of tag names that should be automatically self-closed if they have no
content. Defaults to `['meta', 'img', 'link', 'br', 'hr', 'input', 'area',
'param', 'col', 'base']`.

#### `:preserve => %w[textarea pre]`

A list of tag names that should automatically have their newlines preserved
using the `Haml::Helpers#preserve` helper. This means that any content given on
the same line as the tag will be preserved. For example, `%textarea= "Foo\nBar"`
compiles to `<textarea>Foo&#x000A;Bar</textarea>`. Defaults to `['textarea',
'pre']`.

#### `:encoding => 'utf-8'`

The encoding to use for the HTML output. Only available in Ruby 1.9 or higher.
This can be a string or an Encoding Object. Note that Haml does not
automatically re-encode Ruby values; any strings coming from outside the
application should be converted before being passed into the Haml template.
Defaults to `Encoding.default_internal` or, if that's not set, `"utf-8"`.

### See also

  * [#haml.docs](http://haml-lang.com/docs.html)
  * [Haml Tutorial](http://haml-lang.com/tutorial.html)
  * [Haml Reference](http://haml-lang.com/docs/yardoc/HAML_REFERENCE.md.html)
  * [Whitespace Preservation](http://haml-lang.com/docs/yardoc/HAML_REFERENCE.md.html#whitespace_preservation)


<a name='liquid'></a>
Liquid (`liquid`)
-----------------

Liquid is for rendering safe templates which cannot affect the security
of the server they are rendered on.

### Example

    <html>
      <head>
        <title>{{ title }}</title>
      </head>
      <body>
        <h1>Hello {{ world }}!</h1>
      </body>
    </html>

### Usage

`Tilt::LiquidTemplate` is registered for all files ending in `.liquid` by
default. Liquid templates support locals and objects that respond to
`#to_h` as scopes:

    >> require 'liquid'
    >> require 'tilt'
    >> template = Tilt.new('hello.liquid')
    => #<Tilt::LiquidTemplate @file='hello.liquid'>
    >> scope = { :title => "Hello Liquid Templates" }
    >> template.render(nil, :world => "Liquid")
    => "
    <html>
      <head>
        <title>Hello Liquid Templates</title>
      </head>
      <body>
        <h1>Hello Liquid!</h1>
      </body>
    </html>"

Or, use `Tilt::LiquidTemplate` directly to process strings:

    >> require 'haml'
    >> template = Tilt::HamlTemplate.new { "<h1>Hello Liquid!</h1>" }
    => #<Tilt::LiquidTemplate @file=nil ...>
    >> template.render
    => "<h1>Hello Liquid!</h1>"

__NOTE:__ It's suggested that your program `require 'liquid'` at load
time when using this template engine within a threaded environment.

### See also

  * [Liquid for Programmers](http://wiki.github.com/tobi/liquid/liquid-for-programmers)
  * [Liquid Docs](http://liquid.rubyforge.org/)
  * GitHub: [tobi/liquid](http://github.com/tobi/liquid/)

<a name='markdown'></a>
Markdown (`markdown`, `md`, `mkd`)
----------------------------------

Markdown is a lightweight markup language, created by John Gruber and
Aaron Swartz. For any markup that is not covered by Markdown’s syntax,
HTML is used.  Marking up plain text with Markdown markup is easy and
Markdown formatted texts are readable.

Markdown formatted texts are converted to HTML with the [RDiscount][]
engine, which is a Ruby extension over the fast [Discount][] C library.

### Example

    Hello Markdown Templates
    ========================

    Hello World. This is a paragraph.

### Usage

To wrap a Markdown formatted document with a layout:

    require 'erubis'
    require 'rdiscount'
    layout = Tilt::ErubisTemplate.new(nil, :pattern => '\{% %\}') do
        "<!doctype html><title></title>{%= yield %}"
    end
    data = Tilt::RDiscountTemplate.new { "# hello tilt" }
    layout.render { data.render }
    # => "<!doctype html><title></title><h1>hello tilt</h1>\n"

__NOTE:__ It's suggested that your program `require 'rdiscount'` at load time
when using this template engine in a threaded environment.

### Options

RDiscount supports a variety of flags that control its behavior:

#### `:smart => true|false`

Set `true` to enable [Smarty Pants](http://daringfireball.net/projects/smartypants/)
style punctuation replacement.

#### `:filter_html => true|false`

Set `true` disallow raw HTML in Markdown contents. HTML is converted to
literal text by escaping `<` characters.

### See also

 * [Markdown Syntax Documentation][markdown syntax]
 * GitHub: [rtomayko/rdiscount][rdiscount]

[discount]: http://www.pell.portland.or.us/~orc/Code/discount/ "Discount"
[rdiscount]: http://github.com/rtomayko/rdiscount/ "RDiscount"
[markdown syntax]: (http://daringfireball.net/projects/markdown/syntax/) "Markdown Syntax"


<a name='rdoc'></a>
RDoc (`rdoc`)
-------------

RDoc is the simple text markup system that comes with Ruby's standard
library.

### Usage

__NOTE:__ It's suggested that your program `require 'rdoc/markup'` and
`require 'rdoc/markup/to_html'` at load time when using this template
engine in a threaded environment.

### Example

    = Hello RDoc Templates

    Hello World. This is a paragraph.

### See also

 * [RDoc](http://rdoc.sourceforge.net/doc/index.html)


<a name='radius'></a>
Radius (`radius`)
-----------------

Radius is the template language used by Radiant CMS. It is a tag
language designed to be valid XML/HTML.

### Example

    <html>
    <body>
      <h1><r:title /></h1>
      <ul class="<r:type />">
      <r:repeat times="3">
        <li><r:hello />!</li>
      </r:repeat>
      </ul>
      <r:yield />
    </body>
    </html>

### Usage

To render a template such as the one above.

    scope = OpenStruct.new
    scope.title = "Radius Example"
    scope.hello = "Hello, World!"

    require 'radius'
    template = Tilt::RadiusTemplate.new('example.radius', :tag_prefix=>'r')
    template.render(scope, :type=>'hlist'){ "Jackpot!" }

The result will be:

    <html>
    <body>
      <h1>Radius Example</h1>
      <ul class="hlist">
        <li>Hello, World!</li>
        <li>Hello, World!</li>
        <li>Hello, World!</li>
      </ul>
      Jackpot!
    </body>
    </html>

### See also

* [Radius](http://radius.rubyforge.org/)
* [Radiant](http://radiantcms.org/)
