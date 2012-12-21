# encoding: UTF-8

require 'yajl' unless defined?(Yajl::Parser)
require 'zlib' unless defined?(Zlib)
require 'yajl/gzip/stream_reader.rb'
require 'yajl/gzip/stream_writer.rb'