require 'contest'
require 'tilt'

begin
  require 'rdiscount'

  class RDiscountTemplateTest < Test::Unit::TestCase
    test "registered for '.markdown' files" do
      assert_equal Tilt::RDiscountTemplate, Tilt['test.markdown']
    end

    test "registered for '.md' files" do
      assert_equal Tilt::RDiscountTemplate, Tilt['test.md']
    end

    test "registered for '.mkd' files" do
      assert_equal Tilt::RDiscountTemplate, Tilt['test.mkd']
    end

    test "preparing and evaluating templates on #render" do
      template = Tilt::RDiscountTemplate.new { |t| "# Hello World!" }
      assert_equal "<h1>Hello World!</h1>\n", template.render
    end

    test "smartypants when :smart is set" do
      template = Tilt::RDiscountTemplate.new(:smart => true) { |t|
        "OKAY -- 'Smarty Pants'" }
      assert_equal "<p>OKAY &mdash; &lsquo;Smarty Pants&rsquo;</p>\n",
        template.render
    end

    test "stripping HTML when :filter_html is set" do
      template = Tilt::RDiscountTemplate.new(:filter_html => true) { |t|
        "HELLO <blink>WORLD</blink>" }
      assert_equal "<p>HELLO &lt;blink>WORLD&lt;/blink></p>\n", template.render
    end
  end
rescue LoadError => boom
  warn "Tilt::RDiscountTemplate (disabled)\n"
end
