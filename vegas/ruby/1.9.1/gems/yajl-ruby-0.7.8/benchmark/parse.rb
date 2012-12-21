# encoding: UTF-8
$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__) + '/..')

require 'rubygems'
require 'benchmark'
require 'yajl_ext'
begin
  require 'json'
rescue LoadError
end
begin
  require 'active_support'
rescue LoadError
end

filename = ARGV[0] || 'benchmark/subjects/twitter_search.json'
json = File.new(filename, 'r')

times = ARGV[1] ? ARGV[1].to_i : 1000
puts "Starting benchmark parsing #{File.size(filename)} bytes of JSON data #{times} times\n\n"
Benchmark.bmbm { |x|
  io_parser = Yajl::Parser.new
  io_parser.on_parse_complete = lambda {|obj|} if times > 1
  x.report {
    puts "Yajl::Parser#parse (from an IO)"
    times.times {
      json.rewind
      io_parser.parse(json)
    }
  }
  string_parser = Yajl::Parser.new
  string_parser.on_parse_complete = lambda {|obj|} if times > 1
  x.report {
    puts "Yajl::Parser#parse (from a String)"
    times.times {
      json.rewind
      string_parser.parse(json.read)
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
  if defined?(ActiveSupport::JSON)
    x.report {
      puts "ActiveSupport::JSON.decode"
      times.times {
        json.rewind
        ActiveSupport::JSON.decode(json.read)
      }
    }
  end
}
json.close