Tilt
====

Tilt is a thin interface over a bunch of different Ruby template engines in
an attempt to make their usage as generic possible. This is useful for web
frameworks, static site generators, and other systems that support multiple
template engines but don't want to code for each of them individually.

The following features are supported for all template engines (assuming the
feature is relevant to the engine):

 * Custom template evaluation scopes / bindings
 * Ability to pass locals to template evaluation
 * Support for passing a block to template evaluation for "yield"
 * Backtraces with correct filenames and line numbers
 * Template file caching and reloading
 * Fast, method-based template source compilation

The primary goal is to get all of the things listed above right for all
template engines included in the distribution.

Support for these template engines is included with the package:

    ENGINE                     FILE EXTENSIONS   REQUIRED LIBRARIES
    -------------------------- ----------------- ----------------------------
    ERB                        .erb              none (included ruby stdlib)
    Interpolated String        .str              none (included ruby core)
    Haml                       .haml             haml
    Sass                       .sass             haml
    Less CSS                   .less             less
    Builder                    .builder          builder
    Liquid                     .liquid           liquid
    RDiscount                  .markdown         rdiscount
    RedCloth                   .textile          redcloth
    RDoc                       .rdoc             rdoc
    Radius                     .radius           radius
    Markaby                    .mab              markaby
    Nokogiri                   .nokogiri         nokogiri
    CoffeeScript               .coffee           coffee-script (+node coffee)

See [TEMPLATES.md][t] for detailed information on template engine
options and supported features.

[t]: http://github.com/rtomayko/tilt/blob/master/TEMPLATES.md
   "Tilt Template Engine Documentation"

Basic Usage
-----------

Instant gratification:

    require 'erb'
    require 'tilt'
    template = Tilt.new('templates/foo.erb')
    => #<Tilt::ERBTemplate @file="templates/foo.rb" ...>
    output = template.render
    => "Hello world!"

It's recommended that calling programs explicitly require template engine
libraries (like 'erb' above) at load time. Tilt attempts to lazy require the
template engine library the first time a template is created but this is
prone to error in threaded environments.

The `Tilt` module contains generic implementation classes for all supported
template engines. Each template class adheres to the same interface for
creation and rendering. In the instant gratification example, we let Tilt
determine the template implementation class based on the filename, but
`Tilt::Template` implementations can also be used directly:

    template = Tilt::HamlTemplate.new('templates/foo.haml')
    output = template.render

The `render` method takes an optional evaluation scope and locals hash
arguments. Here, the template is evaluated within the context of the
`Person` object with locals `x` and `y`:

    template = Tilt::ERBTemplate.new('templates/foo.erb')
    joe = Person.find('joe')
    output = template.render(joe, :x => 35, :y => 42)

If no scope is provided, the template is evaluated within the context of an
object created with `Object.new`.

A single `Template` instance's `render` method may be called multiple times
with different scope and locals arguments. Continuing the previous example,
we render the same compiled template but this time in jane's scope:

    jane = Person.find('jane')
    output = template.render(jane, :x => 22, :y => nil)

Blocks can be passed to `render` for templates that support running
arbitrary ruby code (usually with some form of `yield`). For instance,
assuming the following in `foo.erb`:

    Hey <%= yield %>!

The block passed to `render` is called on `yield`:

    template = Tilt::ERBTemplate.new('foo.erb')
    template.render { 'Joe' }
    # => "Hey Joe!"

Template Mappings
-----------------

The `Tilt` module includes methods for associating template implementation
classes with filename patterns and for locating/instantiating template
classes based on those associations.

The `Tilt::register` method associates a filename pattern with a specific
template implementation. To use ERB for files ending in a `.bar` extension:

     >> Tilt.register 'bar', Tilt::ERBTemplate
     >> Tilt.new('views/foo.bar')
     => #<Tilt::ERBTemplate @file="views/foo.bar" ...>

Retrieving the template class for a file or file extension:

     >> Tilt['foo.bar']
     => Tilt::ERBTemplate
     >> Tilt['haml']
     => Tilt::HamlTemplate

It's also possible to register template file mappings that are more specific
than a file extension. To use Erubis for `bar.erb` but ERB for all other `.erb`
files:

     >> Tilt.register 'bar.erb', Tilt::ErubisTemplate
     >> Tilt.new('views/foo.erb')
     => Tilt::ERBTemplate
     >> Tilt.new('views/bar.erb')
     => Tilt::ErubisTemplate

The template class is determined by searching for a series of decreasingly
specific name patterns. When creating a new template with
`Tilt.new('views/foo.html.erb')`, we check for the following template
mappings:

  1. `views/foo.html.erb`
  2. `foo.html.erb`
  3. `html.erb`
  4. `erb`

`Tilt::register` can also be used to select between alternative template
engines. To use Erubis instead of ERB for `.erb` files:

    Tilt.register 'erb', Tilt::ErubisTemplate

Or, use BlueCloth for markdown instead of RDiscount:

    Tilt.register 'markdown', Tilt::BlueClothTemplate

Template Compilation
--------------------

Tilt can compile generated Ruby source code produced by template engines and
reuse on subsequent template invocations. Benchmarks show this yields a 5x-10x
performance increase over evaluating the Ruby source on each invocation.

Template compilation is currently supported for these template engines:
StringTemplate, ERB, Erubis, Haml, and Builder.

To enable template compilation, the `Tilt::CompileSite` module must be mixed in
to the scope object passed to the template's `#render` method. This can be
accomplished by including (with `Module#include`) the module in the class used
for scope objects or by extending (with `Object#extend`) scope objects before
passing to `Template#render`:

    require 'tilt'

    template = Tilt::ERBTemplate.new('foo.erb')

    # Slow. Uses Object#instance_eval to process template
    class Scope
    end
    scope = Scope.new
    template.render(scope)

    # Fast. Uses compiled template and Object#send to process template
    class Scope
      include Tilt::CompileSite
    end
    scope = Scope.new
    template.render(scope)

    # Also fast, though a bit a slower due to having to extend each time
    scope = Object.new
    scope.extend Tilt::CompileSite
    template.render(scope)

When the `Tilt::CompileSite` module is not present, template execution falls
back to evaluating the template from source on each invocation.

LICENSE
-------

Tilt is Copyright (c) 2010 [Ryan Tomayko](http://tomayko.com/about) and
distributed under the MIT license. See the `COPYING` file for more info.
