# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "yajl-ruby"
  s.version = "0.7.8"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Brian Lopez", "Lloyd Hilaiel"]
  s.date = "2010-09-27"
  s.email = "seniorlopez@gmail.com"
  s.extensions = ["ext/extconf.rb"]
  s.extra_rdoc_files = ["README.rdoc", "ext/yajl.c"]
  s.files = ["README.rdoc", "ext/yajl.c", "ext/extconf.rb"]
  s.homepage = "http://github.com/brianmario/yajl-ruby"
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib", "ext"]
  s.rubyforge_project = "yajl-ruby"
  s.rubygems_version = "1.8.24"
  s.summary = "Ruby C bindings to the excellent Yajl JSON stream-based parser library."

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
