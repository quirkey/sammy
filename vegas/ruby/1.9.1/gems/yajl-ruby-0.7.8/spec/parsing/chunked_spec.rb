# encoding: UTF-8
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')
require 'stringio'

describe "Chunked parser" do
  before(:all) do
    @final = [{"abc" => 123}, {"def" => 456}]
  end

  before(:each) do
    @callback = lambda { |hash|
      # no-op
    }
    @parser = Yajl::Parser.new
    @parser.on_parse_complete = @callback
  end

  it "should parse a single chunk" do
    @callback.should_receive(:call).with(@final)
    @parser << '[{"abc": 123},{"def": 456}]'
  end

  it "should parse a single chunk, 3 times" do
    @callback.should_receive(:call).with(@final).exactly(3).times
    @parser << '[{"abc": 123},{"def": 456}]'
    @parser << '[{"abc": 123},{"def": 456}]'
    @parser << '[{"abc": 123},{"def": 456}]'
  end

  it "should parse in two chunks" do
    @callback.should_receive(:call).with(@final)
    @parser << '[{"abc": 123},'
    @parser << '{"def": 456}]'
  end

  it "should parse in 2 chunks, twice" do
    @callback.should_receive(:call).with(@final).exactly(2).times
    @parser << '[{"abc": 123},'
    @parser << '{"def": 456}]'
    @parser << '[{"abc": 123},'
    @parser << '{"def": 456}]'
  end

  it "should parse 2 JSON strings, in 3 chunks" do
    @callback.should_receive(:call).with(@final).exactly(2).times
    @parser << '[{"abc": 123},'
    @parser << '{"def": 456}][{"abc": 123},{"def":'
    @parser << ' 456}]'
  end

  it "should parse 2 JSON strings in 1 chunk" do
    @callback.should_receive(:call).with(@final).exactly(2).times
    @parser << '[{"abc": 123},{"def": 456}][{"abc": 123},{"def": 456}]'
  end

  it "should parse 2 JSON strings from an IO" do
    @callback.should_receive(:call).with(@final).exactly(2).times
    @parser.parse(StringIO.new('[{"abc": 123},{"def": 456}][{"abc": 123},{"def": 456}]'))
  end

  it "should parse a JSON string an IO and fire callback once" do
    @callback.should_receive(:call).with(@final)
    @parser.parse(StringIO.new('[{"abc": 123},{"def": 456}]'))
  end

  it "should parse twitter_stream.json and fire callback 430 times" do
    path = File.expand_path(File.dirname(__FILE__) + '/../../benchmark/subjects/twitter_stream.json')
    json = File.new(path, 'r')
    @callback.should_receive(:call).exactly(430).times
    lambda {
      @parser.parse(json)
    }.should_not raise_error(Yajl::ParseError)
  end

  it "should parse twitter_stream.json and fire callback 430 times, with a block as the callback" do
    path = File.expand_path(File.dirname(__FILE__) + '/../../benchmark/subjects/twitter_stream.json')
    json = File.new(path, 'r')
    @callback.should_receive(:call).exactly(0).times
    @parser.on_parse_complete = nil
    lambda {
      times = 0
      @parser.parse(json) do |hsh|
        times += 1
      end
      times.should eql(430)
    }.should_not raise_error(Yajl::ParseError)
  end

  it "should raise a Yajl::ParseError error if multiple JSON strings were found when no on_parse_complete callback assigned" do
    path = File.expand_path(File.dirname(__FILE__) + '/../../benchmark/subjects/twitter_stream.json')
    json = File.new(path, 'r')
    @parser.on_parse_complete = nil
    @callback.should_receive(:call).exactly(0).times
    lambda {
      @parser.parse(json)
    }.should raise_error(Yajl::ParseError)
  end
end