# encoding: UTF-8
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe "One-off JSON examples" do
  it "should parse 23456789012E666 and return Infinity" do
    infinity = (1.0/0)
    silence_warnings do
      Yajl::Parser.parse(StringIO.new('{"key": 23456789012E666}')).should == {"key" => infinity}
    end
  end

  it "should not parse JSON with a comment, with :allow_comments set to false" do
    json = StringIO.new('{"key": /* this is a comment */ "value"}')
    lambda {
      Yajl::Parser.parse(json, :allow_comments => false)
    }.should raise_error(Yajl::ParseError)
  end

  it "should parse JSON with a comment, with :allow_comments set to true" do
    json = StringIO.new('{"key": /* this is a comment */ "value"}')
    lambda {
      Yajl::Parser.parse(json, :allow_comments => true)
    }.should_not raise_error(Yajl::ParseError)
  end

  it "should not parse invalid UTF8 with :check_utf8 set to true" do
    parser = Yajl::Parser.new(:check_utf8 => true)
    lambda {
      parser.parse("[\"#{"\201\203"}\"]")
    }.should raise_error(Yajl::ParseError)
  end

  it "should parse invalid UTF8 with :check_utf8 set to false" do
    parser = Yajl::Parser.new(:check_utf8 => false)
    parser.parse("[\"#{"\201\203"}\"]").inspect
  end

  it "should parse using it's class method, from an IO" do
    io = StringIO.new('{"key": 1234}')
    Yajl::Parser.parse(io).should == {"key" => 1234}
  end

  it "should parse using it's class method, from an IO with symbolized keys" do
    Yajl::Parser.parse('{"key": 1234}', :symbolize_keys => true).should == {:key => 1234}
  end

  it "should parse using it's class method, from a string" do
    Yajl::Parser.parse('{"key": 1234}').should == {"key" => 1234}
  end

  it "should parse using it's class method, from a string with a block" do
    output = nil
    Yajl::Parser.parse('{"key": 1234}') do |obj|
      output = obj
    end
    output.should == {"key" => 1234}
  end

  it "should parse numbers greater than 2,147,483,648" do
    Yajl::Parser.parse("{\"id\": 2147483649}").should eql({"id" => 2147483649})
    Yajl::Parser.parse("{\"id\": 5687389800}").should eql({"id" => 5687389800})
    Yajl::Parser.parse("{\"id\": 1046289770033519442869495707521600000000}").should eql({"id" => 1046289770033519442869495707521600000000})
  end

  if RUBY_VERSION =~ /^1.9/
    it "should return strings and hash keys in utf-8 if Encoding.default_internal is nil" do
      Encoding.default_internal = nil
      Yajl::Parser.parse('{"key": "value"}').keys.first.encoding.should eql(Encoding.find('utf-8'))
      Yajl::Parser.parse('{"key": "value"}').values.first.encoding.should eql(Encoding.find('utf-8'))
    end

    it "should return strings and hash keys encoded as specified in Encoding.default_internal if it's set" do
      Encoding.default_internal = Encoding.find('utf-8')
      Yajl::Parser.parse('{"key": "value"}').keys.first.encoding.should eql(Encoding.default_internal)
      Yajl::Parser.parse('{"key": "value"}').values.first.encoding.should eql(Encoding.default_internal)
      Encoding.default_internal = Encoding.find('us-ascii')
      Yajl::Parser.parse('{"key": "value"}').keys.first.encoding.should eql(Encoding.default_internal)
      Yajl::Parser.parse('{"key": "value"}').values.first.encoding.should eql(Encoding.default_internal)
    end
  end
end