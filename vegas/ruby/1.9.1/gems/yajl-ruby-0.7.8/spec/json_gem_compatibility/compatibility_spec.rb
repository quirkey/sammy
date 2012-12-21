# encoding: UTF-8
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

class Dummy; end

describe "JSON Gem compatability API" do
  it "shoud not mixin #to_json on base objects until compatability has been enabled" do
    d = Dummy.new

    d.respond_to?(:to_json).should_not be_true
    "".respond_to?(:to_json).should_not be_true
    1.respond_to?(:to_json).should_not be_true
    "1.5".to_f.respond_to?(:to_json).should_not be_true
    [].respond_to?(:to_json).should_not be_true
    {:foo => "bar"}.respond_to?(:to_json).should_not be_true
    true.respond_to?(:to_json).should_not be_true
    false.respond_to?(:to_json).should_not be_true
    nil.respond_to?(:to_json).should_not be_true
  end

  it "should mixin #to_json on base objects after compatability has been enabled" do
    require 'yajl/json_gem'
    d = Dummy.new

    d.respond_to?(:to_json).should be_true
    "".respond_to?(:to_json).should be_true
    1.respond_to?(:to_json).should be_true
    "1.5".to_f.respond_to?(:to_json).should be_true
    [].respond_to?(:to_json).should be_true
    {:foo => "bar"}.respond_to?(:to_json).should be_true
    true.respond_to?(:to_json).should be_true
    false.respond_to?(:to_json).should be_true
    nil.respond_to?(:to_json).should be_true
  end

  it "should require yajl/json_gem to enable the compatability API" do
    defined?(JSON).should be_true

    JSON.respond_to?(:parse).should be_true
    JSON.respond_to?(:generate).should be_true
    JSON.respond_to?(:pretty_generate).should be_true
    JSON.respond_to?(:load).should be_true
    JSON.respond_to?(:dump).should be_true
  end

  it "should allow default parsing options be set with JSON.default_options" do
    default = JSON.default_options[:symbolize_keys]
    JSON.parse('{"foo": 1234}').should === {"foo" => 1234}
    JSON.default_options[:symbolize_keys] = true
    JSON.parse('{"foo": 1234}').should === {:foo => 1234}
    JSON.default_options[:symbolize_keys] = default # ensure the rest of the test cases expect the default
  end

  it "should encode arbitrary classes via their default to_json method" do
    d = Dummy.new
    d.to_json.should == "\"#{d.to_s}\""

    t = Time.now
    t.to_json.should == "\"#{t.to_s}\""

    da = Date.today
    da.to_json.should == "\"#{da.to_s}\""

    dt = DateTime.new
    dt.to_json.should == "\"#{dt.to_s}\""
  end

  it "should have the standard parsing and encoding exceptions mapped" do
    JSON::JSONError.new.is_a?(StandardError).should be_true
    JSON::ParserError.new.is_a?(JSON::JSONError).should be_true
    JSON::GeneratorError.new.is_a?(JSON::JSONError).should be_true

    lambda {
      JSON.parse("blah")
    }.should raise_error(JSON::ParserError)

    lambda {
      JSON.generate(0.0/0.0)
    }.should raise_error(JSON::GeneratorError)
  end

  context "ported tests for Unicode" do
    it "should be able to encode and parse unicode" do
      '""'.should eql(''.to_json)
      '"\\b"'.should eql("\b".to_json)
      '"\u0001"'.should eql(0x1.chr.to_json)
      '"\u001F"'.should eql(0x1f.chr.to_json)
      '" "'.should eql(' '.to_json)
      "\"#{0x7f.chr}\"".should eql(0x7f.chr.to_json)
      utf8 = [ "© ≠ €! \01" ]
      json = "[\"© ≠ €! \\u0001\"]"
      json.should eql(utf8.to_json)
      utf8.should eql(JSON.parse(json))
      utf8 = ["\343\201\202\343\201\204\343\201\206\343\201\210\343\201\212"]
      json = "[\"あいうえお\"]"
      json.should eql(utf8.to_json)
      utf8.should eql(JSON.parse(json))
      utf8 = ['საქართველო']
      json = "[\"საქართველო\"]"
      json.should eql(utf8.to_json)
      utf8.should eql(JSON.parse(json))
      '["Ã"]'.should eql(JSON.generate(["Ã"]))
      ["€"].should eql(JSON.parse('["\u20ac"]'))
      utf8_str = "\xf0\xa0\x80\x81"
      utf8 = [utf8_str]
      json = "[\"#{utf8_str}\"]"
      json.should eql(JSON.generate(utf8))
      utf8.should eql(JSON.parse(json))
    end
  end

  context "ported tests for generation" do
    before(:all) do
      @hash = {
        'a' => 2,
        'b' => 3.141,
        'c' => 'c',
        'd' => [ 1, "b", 3.14 ],
        'e' => { 'foo' => 'bar' },
        'g' => "blah",
        'h' => 1000.0,
        'i' => 0.001
      }

      @json2 = '{"a":2,"b":3.141,"c":"c","d":[1,"b",3.14],"e":{"foo":"bar"},"g":"blah","h":1000.0,"i":0.001}'

      @json3 = %{
        {
          "a": 2,
          "b": 3.141,
          "c": "c",
          "d": [1, "b", 3.14],
          "e": {"foo": "bar"},
          "g": "blah",
          "h": 1000.0,
          "i": 0.001
        }
      }.chomp
    end

    it "should be able to unparse" do
      json = JSON.generate(@hash)
      JSON.parse(@json2).should == JSON.parse(json)
      parsed_json = JSON.parse(json)
      @hash.should == parsed_json
      json = JSON.generate({1=>2})
      '{"1":2}'.should eql(json)
      parsed_json = JSON.parse(json)
      {"1"=>2}.should == parsed_json
    end

    it "should be able to unparse pretty" do
      json = JSON.pretty_generate(@hash)
      JSON.parse(@json3).should == JSON.parse(json)
      parsed_json = JSON.parse(json)
      @hash.should == parsed_json
      json = JSON.pretty_generate({1=>2})
      test = "{\n  \"1\": 2\n}".chomp
      test.should == json
      parsed_json = JSON.parse(json)
      {"1"=>2}.should == parsed_json
    end
  end

  context "ported fixture tests" do
    fixtures = File.join(File.dirname(__FILE__), '../parsing/fixtures/*.json')
    passed, failed = Dir[fixtures].partition { |f| f['pass'] }
    JSON_PASSED = passed.inject([]) { |a, f| a << [ f, File.read(f) ] }.sort
    JSON_FAILED = failed.inject([]) { |a, f| a << [ f, File.read(f) ] }.sort

    JSON_FAILED.each do |name, source|
      it "should not be able to parse #{File.basename(name)} as an IO" do
          lambda {
            JSON.parse(StringIO.new(source))
          }.should raise_error(JSON::ParserError)
      end
    end

    JSON_FAILED.each do |name, source|
      it "should not be able to parse #{File.basename(name)} as a string" do
          lambda {
            JSON.parse(source)
          }.should raise_error(JSON::ParserError)
      end
    end

    JSON_PASSED.each do |name, source|
      it "should be able to parse #{File.basename(name)} as an IO" do
          lambda {
            JSON.parse(StringIO.new(source))
          }.should_not raise_error(JSON::ParserError)
      end
    end

    JSON_PASSED.each do |name, source|
      it "should be able to parse #{File.basename(name)} as a string" do
          lambda {
            JSON.parse(source)
          }.should_not raise_error(JSON::ParserError)
      end
    end
  end
end
