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
    prefix << "// -- Sammy -- #{path}"
    prefix << "// http://code.quirkey.com/sammy"
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

desc 'generate the API documentation'
task :api do
  tmp_doc_path = '/tmp/sammy.api.html'
  api_template_path = 'site/docs/api_template.html'
  final_path   = 'site/docs/api.html'
  File.unlink(tmp_doc_path) if File.readable?(tmp_doc_path)
  sh "ruby vendor/jsdoc/jsdoc.rb lib/sammy.js lib/plugins/ > #{tmp_doc_path}"
  sh "cat #{api_template_path} #{tmp_doc_path} > #{final_path}"
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
task :build_site => [:api, :copy_test_and_examples, :update_version]

desc 'Build the site, then push it to github'
task :site => [:build_site, :push_site]

desc "generate a simple sammy app structure at DIR"
task :generate do 
  dir = ENV['DIR']
  name = File.basename(dir)
  puts "Generating an app #{name} at #{dir}"
  sammy_root = File.expand_path(File.dirname(__FILE__))
  include FileUtils
  path = File.expand_path(dir)
  mkdir_p(path)
  mkdir_p(File.join(path, 'javascripts'))
  mkdir_p(File.join(path, 'stylesheets'))
  mkdir_p(File.join(path, 'images'))
  cp_r(File.join(sammy_root, 'lib'), File.join(path, 'javascripts', 'sammy'))
  cp_r(File.join(sammy_root, 'vendor', 'jquery-1.3.2.js'), File.join(path, 'javascripts', 'jquery-1.3.2.js'))
  index = <<-EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>#{name}</title>

  <link rel="stylesheet" href="/stylesheets/styles.css" type="text/css" media="screen" charset="utf-8"/>

	<script src="javascripts/jquery-1.3.2.js" type="text/javascript" charset="utf-8"></script>
	<script src="javascripts/sammy/sammy.js" type="text/javascript" charset="utf-8"></script>
	<script src="javascripts/#{name}.js" type="text/javascript" charset="utf-8"></script>
</head>

<body>


</body>
</html>
EOT

  js = <<-EOT  
(function($) {

  var app = $.sammy(function() {


  });

  $(function() {
    app.run();
  });


})(jQuery);
EOT
  touch(File.join(path, 'stylesheets', 'style.css'))
  File.open(File.join(path, 'javascripts', "#{name}.js"), 'w') {|f| f << js }
  File.open(File.join(path, "index.html"), 'w') {|f| f << index }
  puts "Done."
end
