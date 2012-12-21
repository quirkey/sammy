# encoding: UTF-8
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe "Yajl" do
  context "dump" do
    it "should exist as a class-method" do
      Yajl.should respond_to(:dump)
    end

    it "should be able to encode to a string" do
      Yajl.dump({:a => 1234}).should eql('{"a":1234}')
    end

    it "should be able to encode to an IO" do
      io = StringIO.new
      Yajl.dump({:a => 1234}, io)
      io.rewind
      io.read.should eql('{"a":1234}')
    end

    it "should be able to encode with a block supplied" do
      Yajl.dump({:a => 1234}) do |chunk|
        chunk.should eql('{"a":1234}')
      end
    end
  end

  context "load" do
    it "should exist as a class-method" do
      Yajl.should respond_to(:load)
    end

    it "should be able to parse from a string" do
      Yajl.load('{"a":1234}').should eql({"a" => 1234})
    end

    it "should be able to parse from an IO" do
      io = StringIO.new('{"a":1234}')
      Yajl.load(io).should eql({"a" => 1234})
    end

    it "should be able to parse from a string with a block supplied" do
      Yajl.load('{"a":1234}') do |h|
        h.should eql({"a" => 1234})
      end
    end

    it "should be able to parse from an IO with a block supplied" do
      io = StringIO.new('{"a":1234}')
      Yajl.load(io) do |h|
        h.should eql({"a" => 1234})
      end
    end
  end
end