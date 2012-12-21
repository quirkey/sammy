require 'contest'
require 'tilt'

begin
  require 'nokogiri'
  class NokogiriTemplateTest < Test::Unit::TestCase
    test "registered for '.nokogiri' files" do
      assert_equal Tilt::NokogiriTemplate, Tilt['test.nokogiri']
      assert_equal Tilt::NokogiriTemplate, Tilt['test.xml.nokogiri']
    end

    test "preparing and evaluating the template on #render" do
      template = Tilt::NokogiriTemplate.new { |t| "xml.em 'Hello World!'" }
      doc = Nokogiri.XML template.render
      assert_equal 'Hello World!', doc.root.text
      assert_equal 'em', doc.root.name
    end

    test "passing locals" do
      template = Tilt::NokogiriTemplate.new { "xml.em('Hey ' + name + '!')" }
      doc = Nokogiri.XML template.render(Object.new, :name => 'Joe')
      assert_equal 'Hey Joe!', doc.root.text
      assert_equal 'em', doc.root.name
    end

    test "evaluating in an object scope" do
      template = Tilt::NokogiriTemplate.new { "xml.em('Hey ' + @name + '!')" }
      scope = Object.new
      scope.instance_variable_set :@name, 'Joe'
      doc = Nokogiri.XML template.render(scope)
      assert_equal 'Hey Joe!', doc.root.text
      assert_equal 'em', doc.root.name
    end

    test "passing a block for yield" do
      template = Tilt::NokogiriTemplate.new { "xml.em('Hey ' + yield + '!')" }
      doc = Nokogiri.XML template.render { 'Joe' }
      assert_equal 'Hey Joe!', doc.root.text
      assert_equal 'em', doc.root.name
    end

    test "block style templates" do
      template =
        Tilt::NokogiriTemplate.new do |t|
          lambda { |xml| xml.em('Hey Joe!') }
        end
      doc = Nokogiri.XML template.render template.render
      assert_equal 'Hey Joe!', doc.root.text
      assert_equal 'em', doc.root.name
    end
  end
rescue LoadError
  warn "Tilt::NokogiriTemplate (disabled)"
end
