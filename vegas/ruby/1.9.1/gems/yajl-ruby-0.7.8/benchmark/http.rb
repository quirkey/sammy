# encoding: UTF-8
$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__) + '/..')

require 'rubygems'
require 'benchmark'
require 'yajl/http_stream'
require 'yajl/gzip'
require 'yajl/deflate'
require 'yajl/bzip2' unless defined?(Bzip2)
require 'json'
require 'uri'
require 'net/http'

uri = URI.parse('http://search.twitter.com/search.json?q=github')
# uri = URI.parse('http://localhost/yajl-ruby.git/benchmark/subjects/contacts.json')

times = ARGV[0] ? ARGV[0].to_i : 1
puts "Starting benchmark parsing #{uri.to_s} #{times} times\n\n"
Benchmark.bmbm { |x|
  x.report {
    puts "Yajl::HttpStream.get"
    times.times {
      Yajl::HttpStream.get(uri)
    }
  }
  x.report {
    puts "JSON.parser"
    times.times {
      JSON.parse(Net::HTTP.get_response(uri).body, :max_nesting => false)
    }
  }
}