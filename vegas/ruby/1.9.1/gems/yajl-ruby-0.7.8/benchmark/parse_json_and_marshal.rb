# encoding: UTF-8
$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__) + '/..')

require 'rubygems'
require 'benchmark'
require 'yajl_ext'
begin
  require 'json'
rescue LoadError
end

# JSON section
filename = 'benchmark/subjects/ohai.json'
marshal_filename = 'benchmark/subjects/ohai.marshal_dump'
json = File.new(filename, 'r')
marshal_file = File.new(marshal_filename, 'r')

hash = {}

times = ARGV[0] ? ARGV[0].to_i : 1000
puts "Starting benchmark parsing #{File.size(filename)} bytes of JSON data #{times} times\n\n"
Benchmark.bmbm { |x|
  x.report {
    puts "Yajl::Parser#parse"
    yajl = Yajl::Parser.new
    yajl.on_parse_complete = lambda {|obj|} if times > 1
    times.times {
      json.rewind
      hash = yajl.parse(json)
    }
  }
  if defined?(JSON)
    x.report {
      puts "JSON.parse"
      times.times {
        json.rewind
        JSON.parse(json.read, :max_nesting => false)
      }
    }
  end
  x.report {
    puts "Marshal.load"
    times.times {
      marshal_file.rewind
      Marshal.load(marshal_file)
    }
  }
}
json.close
marshal_file.close