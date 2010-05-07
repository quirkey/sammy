# jsdoc.rb (by quirkey/Aaron Quint)
# 
# Simple Documentation generator for JavaScript Class files.
#
# usage :
# ruby jsdoc.rb FILE
#
# looks for files formatted like
#
# MyClass = Class.extend({
#   ...
#   // My method does this
#   // with multi line comments
#   myMethod: function(arg1, arg2) {
#     ...
#   },
#   
#   _noDoc: function() {
#     ...
#   }
#   
# });

require 'rubygems'
require 'haml'
require 'rdiscount'
require 'active_support/ordered_hash'

paths = []
while !ARGV.empty?
  path = ARGV.shift
  if File.directory?(path)
    Dir[path + '*.js'].each do |p|
      paths << p
    end
  else
    paths << path
  end
end

if paths.empty?
  raise 'No paths specified'
else
  file = ""
  paths.each {|p| 
    f = File.read(p) 
    if f !~ /^\/\/\sdeprecated/
      file << f
    end
  }
end

# klass_regexp     = /\s*([A-Z][\w\d\.]+)\s+=\s+([A-Z][\w\d\.]+)\.extend\(/
klass_regexp     = /^\s*([A-Z][\w\d\.]+)\s+=\s+function\s*\(([^\)]+)?\)/
function_regexp  = /(\/\/(.*)|(([\w\d_\$]+)\:\s*function\s*\(([\w\d\s,]+)?\))|(function\s+([\w\d_\$]+)\(([\w\d\s,]+)?\)))/im
attribute_regexp = /^\s+([\w\d_\$]+)\:\s+(.*)\,\s+/i

klass   = {:klass => 'Top Level'}
context = nil
current = nil
comment = ""
docs    = ActiveSupport::OrderedHash.new({})

file.each do |line|
  if klass_match = line.match(klass_regexp)
    klass = {
      :klass => klass_match[1].to_s.strip, 
      :args => klass_match[2].to_s.split(',').collect {|a| a.strip },
      :doc => ""
    }
    if context == :comment
      klass[:doc] = comment
      comment = ""
    end
    docs[klass] = {:methods => [], :attributes => []}
  else
    if line_match = line.match(function_regexp)
      current = ((line_match[0] =~ /^\/\//) ? :comment : :method)
      if current == :comment
        this_comment = line_match[2].to_s
        if context == :comment
          comment << this_comment
        else
          comment = this_comment
        end
      elsif current == :method
        meth = {
          :klass => klass,
          :name => line_match[4].to_s,
          :args => line_match[5].to_s.split(',').collect {|a| a.strip }
        }
        if context == :comment
          if !(comment.nil? || comment.strip == '')
            meth[:doc] = comment
            comment = ""
            docs[klass][:methods] << meth
          end
        end
      end
    elsif line_match = line.match(attribute_regexp)
      current = :attribute
      attribute = {
        :klass => klass,
        :name  => line_match[1].to_s,
        :default => line_match[2].to_s
      }
      if context == :comment
        if !(comment.nil? || comment.strip == '')
          attribute[:doc] = comment
          comment = ""
          docs[klass][:attributes] << attribute
        end
      end
    else
      current = nil
    end
    context = current
  end
end

# sort the methods and attributes for each klass
docs.each do |klass, klass_methods|
  docs[klass][:attributes] = klass_methods[:attributes].sort {|a,b| a[:name] <=> b[:name] }
  docs[klass][:methods] = klass_methods[:methods].sort {|a,b| a[:name] <=> b[:name] }
end.reject! do |klass, klass_methods|
  # get rid of undocumented classes
  klass[:doc].nil? || klass[:doc].to_s.strip == ''
end


# class RDoc::Markup::ToHtml
# 
#   def accept_verbatim(am, fragment)
#     @res << annotate("{% highlight javascript %}") << "\n"
#     @res << fragment.txt.split(/\n/).collect {|l| l.gsub(/^\s{4}/,'') }.join("\n")
#     @res << "\n" << annotate("{% endhighlight %}") << "\n"
#   end
# 
# end

module Helper
  extend self
  
  def convert(text)
    final_text = ""
    text.each_line do |l|
      final_text << l.gsub(/^\ #/,'#')
    end
    final_text = RDiscount.new(final_text).to_html
    final_text.gsub!('<pre><code>', "{% highlight javascript %}\n")
    final_text.gsub!('</code></pre>', "{% endhighlight %}\n")
    final_text
  end
  
end

# rdoc = RDoc::Markup::ToHtml.new
template = File.read(File.join(File.dirname(__FILE__), 'doc.haml'))
puts Haml::Engine.new(template).to_html(Helper, {:doc => docs})