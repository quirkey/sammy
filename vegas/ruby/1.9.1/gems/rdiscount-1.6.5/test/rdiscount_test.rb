# encoding: utf-8
rootdir = File.dirname(File.dirname(__FILE__))
$LOAD_PATH.unshift "#{rootdir}/lib"

require 'test/unit'
require 'rdiscount'

class RDiscountTest < Test::Unit::TestCase
  def test_that_discount_does_not_blow_up_with_weird_formatting_case
    text = (<<-TEXT).gsub(/^ {4}/, '').rstrip
    1. some text

    1.
    TEXT
    RDiscount.new(text).to_html
  end

  def test_that_smart_converts_double_quotes_to_curly_quotes
    rd = RDiscount.new(%("Quoted text"), :smart)
    assert_equal %(<p>&ldquo;Quoted text&rdquo;</p>\n), rd.to_html
  end

  def test_that_smart_converts_double_quotes_to_curly_quotes_before_a_heading
    rd = RDiscount.new(%("Quoted text"\n\n# Heading), :smart)
    assert_equal %(<p>&ldquo;Quoted text&rdquo;</p>\n\n<h1>Heading</h1>\n), rd.to_html
  end

  def test_that_smart_converts_double_quotes_to_curly_quotes_after_a_heading
    rd = RDiscount.new(%(# Heading\n\n"Quoted text"), :smart)
    assert_equal %(<h1>Heading</h1>\n\n<p>&ldquo;Quoted text&rdquo;</p>\n), rd.to_html
  end

  def test_that_smart_gives_ve_suffix_a_rsquo
    rd = RDiscount.new("I've been meaning to tell you ..", :smart)
    assert_equal "<p>I&rsquo;ve been meaning to tell you ..</p>\n", rd.to_html
  end

  def test_that_smart_gives_m_suffix_a_rsquo
    rd = RDiscount.new("I'm not kidding", :smart)
    assert_equal "<p>I&rsquo;m not kidding</p>\n", rd.to_html
  end

  def test_that_smart_gives_d_suffix_a_rsquo
    rd = RDiscount.new("what'd you say?", :smart)
    assert_equal "<p>what&rsquo;d you say?</p>\n", rd.to_html
  end

  def test_that_generate_toc_sets_toc_ids
    rd = RDiscount.new("# Level 1\n\n## Level 2", :generate_toc)
    assert rd.generate_toc
    assert_equal %(<h1 id="Level+1\">Level 1</h1>\n\n<h2 id="Level+2\">Level 2</h2>\n), rd.to_html
  end

  def test_should_get_the_generated_toc
    rd = RDiscount.new("# Level 1\n\n## Level 2", :generate_toc)
    exp = %(<ul>\n <li><a href="#Level+1">Level 1</a>\n  <ul>\n  <li><a href="#Level+2">Level 2</a>  </li>\n  </ul>\n </li>\n </ul>)
    assert_equal exp, rd.toc_content.strip
  end

  if "".respond_to?(:encoding)
    def test_should_return_string_in_same_encoding_as_input
      input = "Yogācāra"
      output = RDiscount.new(input).to_html
      assert_equal input.encoding.name, output.encoding.name
    end
  end

  def test_that_no_image_flag_works
    rd = RDiscount.new(%(![dust mite](http://dust.mite/image.png) <img src="image.png" />), :no_image)
    assert rd.to_html !~ /<img/
  end

  def test_that_no_links_flag_works
    rd = RDiscount.new(%([This link](http://example.net/) <a href="links.html">links</a>), :no_links)
    assert rd.to_html !~ /<a /
  end

  def test_that_no_tables_flag_works
    rd = RDiscount.new(<<EOS, :no_tables)
 aaa | bbbb
-----|------
hello|sailor
EOS
    assert rd.to_html !~ /<table/
  end

  def test_that_strict_flag_works
    rd = RDiscount.new("foo_bar_baz", :strict)
    assert_equal "<p>foo<em>bar</em>baz</p>\n", rd.to_html
  end

  def test_that_autolink_flag_works
    rd = RDiscount.new("http://github.com/rtomayko/rdiscount", :autolink)
    assert_equal "<p><a href=\"http://github.com/rtomayko/rdiscount\">http://github.com/rtomayko/rdiscount</a></p>\n", rd.to_html
  end

  def test_that_safelink_flag_works
    rd = RDiscount.new("[IRC](irc://chat.freenode.org/#freenode)", :safelink)
    assert_equal "<p>[IRC](irc://chat.freenode.org/#freenode)</p>\n", rd.to_html
  end

  def test_that_no_pseudo_protocols_flag_works
    rd = RDiscount.new("[foo](id:bar)", :no_pseudo_protocols)
    assert_equal "<p>[foo](id:bar)</p>\n", rd.to_html
  end
end
