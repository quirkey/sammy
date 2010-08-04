require 'sinatra/base'
require 'haml'
require 'sass'
require 'cloudkit'

class Tasks < Sinatra::Application

  use CloudKit::Service, :collections => [:tasks]

  set :public, File.join(File.dirname(__FILE__), 'public')

  get '/' do
    haml :index
  end

  get '/stylesheets/:sheet.css' do
    sass :"#{params['sheet']}"
  end

end
