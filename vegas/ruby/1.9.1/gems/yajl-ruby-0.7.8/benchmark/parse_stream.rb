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

filename = 'benchmark/subjects/twitter_stream.json'
json = File.new(filename, 'r')

times = ARGV[0] ? ARGV[0].to_i : 100
puts "Starting benchmark parsing JSON stream (#{File.size(filename)} bytes of JSON data with 430 JSON separate strings) #{times} times\n\n"
Benchmark.bmbm { |x|
  parser = Yajl::Parser.new
  parser.on_parse_complete = lambda {|obj|}
  x.report {
    puts "Yajl::Parser#parse"
    times.times {
      json.rewind
      parser.parse(json)
    }
  }
  if defined?(JSON)
    x.report {
      puts "JSON.parse"
      times.times {
        json.rewind
        while chunk = json.gets
          JSON.parse(chunk, :max_nesting => false)
        end
      }
    }
  end
  if defined?(ActiveSupport::JSON)
    x.report {
      puts "ActiveSupport::JSON.decode"
      times.times {
        json.rewind
        while chunk = json.gets
          ActiveSupport::JSON.decode(chunk)
        end
      }
    }
  end
}
json.close