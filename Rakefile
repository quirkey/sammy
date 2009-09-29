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
    latest_min_path = File.join(dir, path.gsub(/\.js$/, "-lastest.min.js"))
    
    sh "#{java_path} -jar #{yui_path} -o #{min_path} lib/#{path}"
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
  test_path = ENV['TEST'] || File.join(File.dirname(__FILE__), 'test', 'sammy.html')
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
  system "open #{File.join(File.dirname(__FILE__), 'test', 'sammy.html')}"
end

desc 'generate the API documentation'
task :api do
  tmp_doc_path = '/tmp/sammy.api.html'
  api_template_path = 'site/docs/api_template.html'
  final_path   = 'site/docs/api.html'
  
  sh "ruby vendor/jsdoc/jsdoc.rb lib/sammy.js lib/plugins/ > #{tmp_doc_path}"
  sh "cat #{api_template_path} #{tmp_doc_path} > #{final_path}"
end

desc 'copy files into the site branch'
task :copy_test_and_examples do
  sh "cp -r examples site/examples"
  sh "cp -r test site/test"
end


desc 'update the current version # in the pages'
task :update_version => :version do
  Dir['site/**/*.*'].each do |file|
    File.open(file, 'r+') do |f|
      contents = f.read
      contents.gsub!(/current_version\: ([\d\.]+)/, "current_version: #{@version}")
      f.truncate(0)
      f.rewind
      f << contents
    end
  end
end

task :push_site do
  sh "cd site && git add ."
  sh "cd site && git commit -am 'Updated Site via Rake'"
  sh "cd site && git push upstream gh-pages"
end

desc 'Prepare the site'
task :site => [:api, :copy_test_and_examples, :update_version, :push_site]
