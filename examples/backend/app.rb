require 'sinatra'
require 'cloudkit'

class Tasks < Sinatra::Default
  
  use CloudKit::Service, :collections => [:tasks]
  
  get '/' do
    haml :index
  end
    
end