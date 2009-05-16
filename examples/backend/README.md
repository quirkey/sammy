# Sammy

## Backend Example

This is a simple To-do list type application built with a simple ruby backend and a sammy front-end.

The backend is built using sinatra (+rack),  and [cloudkit](http://getcloudkit.com).

### Setup

Besides Ruby you also need some gems.
Currently, there are some issues with Rack 1.0 and Sinatra so you need to install the pre-release sinatra from github.

  sudo gem install cloudkit haml
  sudo gem install sinatra-sinatra -s http://gems.github.com
  
Once you have everything installed from this directory (examples/backend) run:

  rake start
  
### Notes

!!! Todo's are stored in memory! AKA if you restart the rack application you will loose you're todos. This is really just a demonstration. If you really want to use this, check the [cloudkit](http://getcloudkit.com) docs to see how to set cloudkit up to store info in Tokyo Cabinent.