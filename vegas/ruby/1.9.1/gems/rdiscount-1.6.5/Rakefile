require 'date'
require 'rake/clean'
require 'digest/md5'

task :default => :test

# ==========================================================
# Ruby Extension
# ==========================================================

DLEXT = Config::CONFIG['DLEXT']
RUBYDIGEST = Digest::MD5.hexdigest(`#{RUBY} --version`)

file "ext/ruby-#{RUBYDIGEST}" do |f|
  rm_f FileList["ext/ruby-*"]
  touch f.name
end
CLEAN.include "ext/ruby-*"

file 'ext/Makefile' => FileList['ext/*.{c,h,rb}', "ext/ruby-#{RUBYDIGEST}"] do
  chdir('ext') { ruby 'extconf.rb' }
end
CLEAN.include 'ext/Makefile', 'ext/mkmf.log'

file "ext/rdiscount.#{DLEXT}" => FileList["ext/Makefile"] do |f|
  sh 'cd ext && make clean && make && rm -rf conftest.dSYM'
end
CLEAN.include 'ext/*.{o,bundle,so,dll}'

file "lib/rdiscount.#{DLEXT}" => "ext/rdiscount.#{DLEXT}" do |f|
  cp f.prerequisites, "lib/", :preserve => true
end

desc 'Build the rdiscount extension'
task :build => "lib/rdiscount.#{DLEXT}"

# ==========================================================
# Manual
# ==========================================================

file 'man/rdiscount.1' => 'man/rdiscount.1.ronn' do
  sh "ronn --manual=RUBY -b man/rdiscount.1.ronn"
end
CLOBBER.include 'man/rdiscount.1'

desc 'Build manpages'
task :man => 'man/rdiscount.1'

# ==========================================================
# Testing
# ==========================================================

require 'rake/testtask'
Rake::TestTask.new('test:unit') do |t|
  t.test_files = FileList['test/*_test.rb']
  t.ruby_opts += ['-rubygems'] if defined? Gem
end
task 'test:unit' => [:build]

desc 'Run conformance tests (MARKDOWN_TEST_VER=1.0)'
task 'test:conformance' => [:build] do |t|
  script = "#{pwd}/bin/rdiscount"
  test_version = ENV['MARKDOWN_TEST_VER'] || '1.0.3'
  chdir("test/MarkdownTest_#{test_version}") do
    sh "./MarkdownTest.pl --script='#{script}' --tidy"
  end
end

desc 'Run version 1.0 conformance suite'
task 'test:conformance:1.0' => [:build] do |t|
  ENV['MARKDOWN_TEST_VER'] = '1.0'
  Rake::Task['test:conformance'].invoke
end

desc 'Run 1.0.3 conformance suite'
task 'test:conformance:1.0.3' => [:build] do |t|
  ENV['MARKDOWN_TEST_VER'] = '1.0.3'
  Rake::Task['test:conformance'].invoke
end

desc 'Run unit and conformance tests'
task :test => %w[test:unit test:conformance]

desc 'Run benchmarks'
task :benchmark => :build do |t|
  $:.unshift 'lib'
  load 'test/benchmark.rb'
end

# ==========================================================
# Documentation
# ==========================================================

desc 'Generate API documentation'
task :doc => 'doc/index.html'

file 'doc/index.html' => FileList['lib/*.rb'] do |f|
  sh((<<-end).gsub(/\s+/, ' '))
    hanna --charset utf8 --fmt html --inline-source --line-numbers \
          --main RDiscount --op doc --title 'RDiscount API Documentation' \
          #{f.prerequisites.join(' ')}
  end
end

CLEAN.include 'doc'

# ==========================================================
# Update package's Discount sources
# ==========================================================

desc 'Gather required discount sources into extension directory'
task :gather => 'discount' do |t|
  files =
    FileList[
      'discount/{markdown,mkdio,amalloc,cstring,tags}.h',
      'discount/{markdown,docheader,dumptree,generate,mkdio,resource,toc,Csio,xml,css,basename,emmatch,tags,html5}.c'
    ]
  cp files, 'ext/',
    :preserve => true,
    :verbose => true
  cp 'discount/markdown.7', 'man/'
end

# best. task. ever.
file 'discount' do |f|
  STDERR.puts((<<-TEXT).gsub(/^ +/, ''))
    Sorry, this operation requires a human. Tell your human to:

    Grab a discount tarball from:
    http://www.pell.portland.or.us/~orc/Code/discount/

    Extract here with something like:
    tar xvzf discount-1.2.9.tar.gz

    Create a discount symlink pointing at the version directory:
    ln -hsf discount-1.2.9 discount

  TEXT
  fail "discount sources required."
end

# PACKAGING =================================================================

require 'rubygems'
$spec = eval(File.read('rdiscount.gemspec'))

def package(ext='')
  "pkg/rdiscount-#{$spec.version}" + ext
end

desc 'Build packages'
task :package => %w[.gem .tar.gz].map {|e| package(e)}

desc 'Build and install as local gem'
task :install => package('.gem') do
  sh "gem install #{package('.gem')}"
end

directory 'pkg/'

file package('.gem') => %w[pkg/ rdiscount.gemspec] + $spec.files do |f|
  sh "gem build rdiscount.gemspec"
  mv File.basename(f.name), f.name
end

file package('.tar.gz') => %w[pkg/] + $spec.files do |f|
  sh "git archive --format=tar HEAD | gzip > #{f.name}"
end

# GEMSPEC HELPERS ==========================================================

def source_version
  line = File.read('lib/rdiscount.rb')[/^\s*VERSION = .*/]
  line.match(/.*VERSION = '(.*)'/)[1]
end

file 'rdiscount.gemspec' => FileList['Rakefile','lib/rdiscount.rb'] do |f|
  # read spec file and split out manifest section
  spec = File.read(f.name)
  head, manifest, tail = spec.split("  # = MANIFEST =\n")
  head.sub!(/\.version = '.*'/, ".version = '#{source_version}'")
  head.sub!(/\.date = '.*'/, ".date = '#{Date.today.to_s}'")
  # determine file list from git ls-files
  files = `git ls-files`.
    split("\n").
    sort.
    reject{ |file| file =~ /^\./ || file =~ /^test\/MarkdownTest/ }.
    map{ |file| "    #{file}" }.
    join("\n")
  # piece file back together and write...
  manifest = "  s.files = %w[\n#{files}\n  ]\n"
  spec = [head,manifest,tail].join("  # = MANIFEST =\n")
  File.open(f.name, 'w') { |io| io.write(spec) }
  puts "updated #{f.name}"
end
