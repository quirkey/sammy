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
# Can't use ActiveSuport::JSON.encode with the JSON gem loaded
# begin
#   require 'active_support'
# rescue LoadError
# end

filename = ARGV[0] || 'benchmark/subjects/ohai.json'
json = File.new(filename, 'r')
hash = Yajl::Parser.new.parse(json)
json.close

times = ARGV[1] ? ARGV[1].to_i : 1000
puts "Starting benchmark encoding #{filename} #{times} times\n\n"
Benchmark.bmbm { |x|
  io_encoder = Yajl::Encoder.new
  x.report {
    puts "Yajl::Encoder#encode (to an IO)"
    times.times {
      io_encoder.encode(hash, StringIO.new)
    }
  }
  string_encoder = Yajl::Encoder.new
  x.report {
    puts "Yajl::Encoder#encode (to a String)"
    times.times {
      output = string_encoder.encode(hash)
    }
  }
  if defined?(JSON)
    x.report {
      puts "JSON.generate"
      times.times {
        JSON.generate(hash)
      }
    }
  end
  # Can't use ActiveSuport::JSON.encode with the JSON gem loaded
  #
  # if defined?(ActiveSupport::JSON)
  #   x.report {
  #     puts "ActiveSupport::JSON.encode"
  #     times.times {
  #       ActiveSupport::JSON.encode(hash)
  #     }
  #   }
  # end
}
