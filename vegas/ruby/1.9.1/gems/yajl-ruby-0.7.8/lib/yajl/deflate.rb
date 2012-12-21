# encoding: UTF-8

require 'yajl' unless defined?(Yajl::Parser)
require 'zlib' unless defined?(Zlib)
require 'yajl/deflate/stream_reader.rb'
require 'yajl/deflate/stream_writer.rb'