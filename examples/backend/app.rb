gem 'sinatra-sinatra', '>=0.9.1.3'
require 'sinatra'
require 'haml'
require 'sass'
require 'cloudkit'

class Tasks < Sinatra::Default
  
  use CloudKit::Service, :collections => [:tasks]
  
  get '/' do
    haml :index
  end
  
  get '/stylesheets/:sheet.css' do
    sass :"#{params['sheet']}"
  end
end