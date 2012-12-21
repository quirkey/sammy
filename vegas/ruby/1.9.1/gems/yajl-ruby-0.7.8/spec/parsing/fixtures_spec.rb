# encoding: UTF-8
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe "Parsing JSON Fixtures" do
  fixtures = File.join(File.dirname(__FILE__), 'fixtures/*.json')
  passed, failed = Dir[fixtures].partition { |f| f['pass'] }
  PASSED = passed.inject([]) { |a, f| a << [ f, File.read(f) ] }.sort
  FAILED = failed.inject([]) { |a, f| a << [ f, File.read(f) ] }.sort

  FAILED.each do |name, source|
    it "should not be able to parse #{File.basename(name)} as an IO" do
        lambda {
          Yajl::Parser.parse(StringIO.new(source))
        }.should raise_error(Yajl::ParseError)
    end
  end

  FAILED.each do |name, source|
    it "should not be able to parse #{File.basename(name)} as a string" do
        lambda {
          Yajl::Parser.parse(source)
        }.should raise_error(Yajl::ParseError)
    end
  end

  PASSED.each do |name, source|
    it "should be able to parse #{File.basename(name)} as an IO" do
        lambda {
          Yajl::Parser.parse(StringIO.new(source))
        }.should_not raise_error(Yajl::ParseError)
    end
  end

  PASSED.each do |name, source|
    it "should be able to parse #{File.basename(name)} as a string" do
        lambda {
          Yajl::Parser.parse(source)
        }.should_not raise_error(Yajl::ParseError)
    end
  end
end