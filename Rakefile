desc 'Pulls the current version from lib/sammy.js'
task :version do
  f = File.read('lib/sammy.js')
  @version = f.match(/Sammy.VERSION \= \'([\d\w\.]+)\'/)[1]
  puts "VERSION: " + @version
end

desc 'Uses the yui-compressor to minify lib/sammy.js'
task :minify => :version do
  yui_path = ENV['YUI_PATH'] || '~/Sites/yui/yuicompressor-2.4.2.jar'
  java_path = ENV['JAVA_PATH'] || '/usr/bin/java'
  puts "Minify-ing"
  
  # compress each file
  Dir['lib/**/*.js'].each do |path|
    if path =~ /\.min\.js$/
      File.unlink(path)
      next 
    end
    path.gsub!('lib','')
    
    dir             = 'lib/min'
    min_path        = File.join(dir, path.gsub(/\.js$/, "-#{@version}.min.js"))
    latest_min_path = File.join(dir, path.gsub(/\.js$/, "-latest.min.js"))
    
    `#{java_path} -jar #{yui_path} -o #{min_path} lib/#{path}`
    minified = File.read(min_path)
    prefix = []
    prefix << "// -- Sammy.js -- #{path}"
    prefix << "// http://sammyjs.org"
    prefix << "// Version: #{@version}"
    prefix << "// Built: #{Time.now}"
    File.open(min_path, 'w') do |f|
      f << prefix.join("\n") << "\n"
      f << minified
    end
    FileUtils.copy(min_path, latest_min_path)
  end
end

# Modified from peterc: http://gist.github.com/113226
desc "Automatically run something when code is changed"
task :autotest do
  require 'find'
  files = {}
  test_path = ENV['TEST'] || File.join(File.dirname(__FILE__), 'test', 'index.html')
  loop do
    changed = false
    Find.find(File.dirname(__FILE__)) do |file|
      next unless file =~ /\.js$/
      ctime = File.ctime(file).to_i
 
      if ctime != files[file]
        files[file] = ctime
        changed = true
      end
    end
 
    if changed
      puts "Running #{test_path} at #{Time.now}"
      system "open #{test_path}"
      puts "\nWaiting for a *.js change"
    end
 
    sleep 1
  end
end

desc 'launch the test file in the browser' 
task :test do
  system "open #{File.join(File.dirname(__FILE__), 'test', 'index.html')}"
end


desc 'copy files into the site branch'
task :copy_test_and_examples do
  sh "mkdir -p site/examples site/test site/lib site/vendor"
  sh "cp -r examples/* site/examples/"
  sh "cp -r test/* site/test/"
  sh "cp -r lib/* site/lib/"
  sh "cp -r vendor/* site/vendor/"
end


desc 'update the current version # in the pages'
task :update_version => :version do
  Dir['site/**/*.*'].each do |file|
    File.open(file, 'r+') do |f|
      contents = f.read
      contents.gsub!(/current_version\: ([\w\d\.]+)/, "current_version: #{@version}")
      f.truncate(0)
      f.rewind
      f << contents
    end
  end
end

desc 'Tag with the current version'
task :tag => :version do
  sh "git add ."
  sh "git commit -a -m'Pushing version #{@version}'"
  sh "git tag v#{@version}"
  sh "git push --tags"
end

task :release => [:minify, :tag, :site]

task :push_site do
  sh "cd site && git add ."
  sh "cd site && git commit -am 'Updated Site via Rake'"
  sh "cd site && git push upstream gh-pages"
end

desc 'Build the site'
task :build_site => [:copy_test_and_examples, :update_version]

desc 'Build the site, then push it to github'
task :site => [:build_site, :push_site]

desc 'Generate the docs for the current version to DIR'
task :docs => :version do
  @version = ENV['VERSION'] if ENV['VERSION']
  sh "ruby vendor/jsdoc/jsdoc.rb #{ENV['DIR']} #{@version} lib/ lib/plugins/"
end
