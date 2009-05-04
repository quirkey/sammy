;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    
    var db, db_loaded;
    db = null;
    db_loaded = false;
    
                    
    before(function() { with(this) {
      if (!db_loaded) {
        redirect('#/connecting');
        return false;
      }
    }});
    
    // display tasks
    get('#/', function() { with (this) {
      $('#tasks').html('');
      each(db.collection('tasks').all(), function(i, task) {
        this.render('partial', '#tasks', '/templates/task.html.erb', task.json());
      });
    }});
    
    post('#/tasks', function() { with(this) {
      var context = this;
      var task    = {
        entry: params['entry'], 
        completed: false, 
        created_at: Date()
      };
      db.collection('tasks').create(task, {
        success: function(task) {
          context.render('partial', '#tasks', '/templates/task.html.erb', task.json());
        },
        error: function() {
          context.trigger('error', {message: 'Sorry, could not save your task.'})
        }
      });
      return false;
    }});
    
    get('#/connecting', function() { with(this) {
      render('html', '<span class="loading">... Loading ...</span>');
    }});
          
    bind('run', function() {
      var context = this;
      db = $.cloudkit;
      db.boot({
        success: function() {
          db_loaded = true;
          context.trigger('db-loaded');
        },
        failure: function() {
          db_loaded = false;
          context.trigger('error', {message: 'Could not connect to CloudKit.'})
        }
      });
      
      $('li.task').live('click', function() {
        
      });
    });
    
    bind('db-loaded', function() { with(this) {
      redirect('#/')
    }});
    
    bind('error', function(e, data) { with(this) {
      render('text', '#error', data.message).show();
    }});
    
    
  }});
  
  $(function() {
    app.addLogger(function(e, data) {
      $('#debug').append([app.toString(), app.namespace, e.cleaned_type, data, '<br />'].join(' '));
    })
    app.run('#/');
  })
})(jQuery);