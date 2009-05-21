desc 'Pulls the current version from lib/sammy.js'
task :version do
  f = File.read('lib/sammy.js')
  @version = f.match(/Sammy.VERSION \= \'([\d\.]+)\'/)[1]
  puts "VERSION: " + @version
end

desc 'Uses the yui-compressor to minify lib/sammy.js'
task :minify => :version do
  yui_path = ENV['YUI_PATH'] || '~/Sites/yui/yuicompressor-2.4.2.jar'
  java_path = ENV['JAVA_PATH'] || '/usr/bin/java'
  min_path = 'lib/sammy.min.js'
  puts "Minify-ing"
  sh "#{java_path} -jar #{yui_path} -o #{min_path} lib/sammy.js"
  
  minified = File.read(min_path)
  prefix = []
  prefix << "// -- Sammy --"
  prefix << "// http://code.quirkey.com/sammy"
  prefix << "// Version: #{@version}"
  prefix << "// Built: #{Time.now}"
  File.open(min_path, 'w') do |f|
    f << prefix.join("\n") << "\n"
    f << minified
  end
end


desc "Automatically run something when code is changed"
task :on_update do
  require 'find'
  files = {}
 
  loop do
    changed = false
    Find.find(File.dirname(__FILE__)) do |file|
      next unless file =~ /\.rb$/
      ctime = File.ctime(file).to_i
 
      if ctime != files[file]
        files[file] = ctime
        changed = true
      end
    end
 
    if changed
      system ARGV[1]
      puts "\nWaiting for a *.rb change"
    end
 
    sleep 1
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