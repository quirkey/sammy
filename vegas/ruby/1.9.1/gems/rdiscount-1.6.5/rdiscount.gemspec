Gem::Specification.new do |s|
  s.name = 'rdiscount'
  s.version = '1.6.5'
  s.summary = "Fast Implementation of Gruber's Markdown in C"
  s.date = '2010-06-15'
  s.email = 'rtomayko@gmail.com'
  s.homepage = 'http://github.com/rtomayko/rdiscount'
  s.has_rdoc = true
  s.authors = ["Ryan Tomayko", "David Loren Parsons", "Andrew White"]
  # = MANIFEST =
  s.files = %w[
    COPYING
    README.markdown
    Rakefile
    bin/rdiscount
    ext/Csio.c
    ext/amalloc.h
    ext/basename.c
    ext/config.h
    ext/css.c
    ext/cstring.h
    ext/docheader.c
    ext/dumptree.c
    ext/emmatch.c
    ext/extconf.rb
    ext/generate.c
    ext/html5.c
    ext/markdown.c
    ext/markdown.h
    ext/mkdio.c
    ext/mkdio.h
    ext/rdiscount.c
    ext/resource.c
    ext/tags.c
    ext/tags.h
    ext/toc.c
    ext/xml.c
    lib/markdown.rb
    lib/rdiscount.rb
    man/markdown.7
    man/rdiscount.1
    man/rdiscount.1.ronn
    rdiscount.gemspec
    test/benchmark.rb
    test/benchmark.txt
    test/markdown_test.rb
    test/rdiscount_test.rb
  ]
  # = MANIFEST =
  s.test_files = ["test/markdown_test.rb", "test/rdiscount_test.rb"]
  s.extra_rdoc_files = ["COPYING"]
  s.extensions = ["ext/extconf.rb"]
  s.executables = ["rdiscount"]
  s.require_paths = ["lib"]
  s.rubyforge_project = 'wink'
end
