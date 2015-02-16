desc 'Pulls the current version from lib/sammy.js'
task :version do
  f = File.read('lib/sammy.js')
  @version = f.match(/Sammy.VERSION \= \'([\d\w\.]+)\'/)[1]
  puts "VERSION: " + @version
end

desc 'Uses the uglify to minify lib/sammy.js'
task :minify => :version do
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
    
    `uglifyjs lib/#{path} > #{min_path}`
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

desc 'Tag with the current version'
task :tag => :version do
  sh "git add ."
  sh "git commit -a -m'Pushing version #{@version}'"
  sh "git tag v#{@version}"
  sh "git push --tags"
end

task :release => [:minify, :tag]

desc 'Generate the docs for the current version to DIR'
task :docs => :version do
  @version = ENV['VERSION'] if ENV['VERSION']
  sh "ruby vendor/jsdoc/jsdoc.rb #{ENV['DIR']} #{@version} lib/ lib/plugins/"
end
