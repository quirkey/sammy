require 'contest'
require 'tilt'

begin
  require 'rdoc/markup'
  require 'rdoc/markup/to_html'
  class RDocTemplateTest < Test::Unit::TestCase
    test "is registered for '.rdoc' files" do
      assert_equal Tilt::RDocTemplate, Tilt['test.rdoc']
    end

    test "preparing and evaluating the template with #render" do
      template = Tilt::RDocTemplate.new { |t| "= Hello World!" }
      assert_equal "<h1>Hello World!</h1>\n", template.render
    end
  end
rescue LoadError => boom
  warn "Tilt::RDocTemplate (disabled)\n"
end
