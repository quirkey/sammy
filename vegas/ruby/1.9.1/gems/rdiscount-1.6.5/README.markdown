Discount Markdown Processor for Ruby
====================================

Discount is an implementation of John Gruber's Markdown markup language in C. It
implements all of the language described in [the markdown syntax document][1] and
passes the [Markdown 1.0 test suite][2].

CODE: `git clone git://github.com/rtomayko/rdiscount.git`  
HOME: <http://github.com/rtomayko/rdiscount>  
DOCS: <http://rdoc.info/projects/rtomayko/rdiscount>  
BUGS: <http://github.com/rtomayko/rdiscount/issues>

Discount was developed by [David Loren Parsons][3]. The Ruby extension
is maintained by [Ryan Tomayko][4].

[1]: http://daringfireball.net/projects/markdown/syntax
[2]: http://daringfireball.net/projects/downloads/MarkdownTest_1.0.zip
[3]: http://www.pell.portland.or.us/~orc
[4]: http://tomayko.com/about

INSTALL, HACKING
----------------

New releases of RDiscount are published to [gemcutter][]:

    $ [sudo] gem install rdiscount -s http://gemcutter.org

The RDiscount sources are available via Git:

    $ git clone git://github.com/rtomayko/rdiscount.git
    $ cd rdiscount
    $ rake --tasks

[gemcutter]: http://gemcutter.org/gems/rdiscount

USAGE
-----

RDiscount implements the basic protocol popularized by RedCloth and adopted
by BlueCloth:

    require 'rdiscount'
    markdown = RDiscount.new("Hello World!")
    puts markdown.to_html

Additional processing options can be turned on when creating the
RDiscount object:

    markdown = RDiscount.new("Hello World!", :smart, :filter_html)

Inject RDiscount into your BlueCloth-using code by replacing your bluecloth
require statements with the following:

    begin
      require 'rdiscount'
      BlueCloth = RDiscount
    rescue LoadError
      require 'bluecloth'
    end

COPYING
-------

Discount is free software;  it is released under a BSD-style license
that allows you to do as you wish with it as long as you don't attempt
to claim it as your own work. RDiscount adopts Discount's license
verbatim. See the file `COPYING` for more information.

