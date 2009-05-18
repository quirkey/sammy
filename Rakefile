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