# encoding: UTF-8
$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__) + '/..')

require 'rubygems'
require 'benchmark'
require 'yajl_ext'
require 'stringio'
begin
  require 'json'
rescue LoadError
end

times = ARGV[0] ? ARGV[0].to_i : 1000
filename = 'benchmark/subjects/ohai.json'
json = File.new(filename, 'r')
hash = Yajl::Parser.new.parse(json)
json.close

puts "Starting benchmark encoding #{filename} #{times} times\n\n"
Benchmark.bmbm { |x|
  encoder = Yajl::Encoder.new
  x.report {
    puts "Yajl::Encoder#encode"
    times.times {
      encoder.encode(hash, StringIO.new)
    }
  }
  if defined?(JSON)
    x.report {
      puts "JSON's #to_json"
      times.times {
        JSON.generate(hash)
      }
    }
  end
  x.report {
    puts "Marshal.dump"
    times.times {
      Marshal.dump(hash)
    }
  }
}
