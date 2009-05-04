;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    
    var db, db_loaded;
    db = null;
    db_loaded = false;
    
    var renderTask = function(task) {
      // $('#tasks').append('<li class="task" id="' + task.id() + '">' + task.json().entry + '</li>');
      
    }
                
    before(function() { with(this) {
      if (!db_loaded) {
        redirect('#/connecting');
        return false;
      }
    }});
    
    // display tasks
    get('#/', function() { with (this) {
      $('#tasks').html('');
      $.each(db.collection('tasks').all(), function(i, task) {
        renderTask(task);
      });
    }});
    
    post('#/tasks', function() { with(this) {
      var context = this;
      var task    = {entry: params['entry'], created_at: Date()};
      db.collection('tasks').create(task, {
        success: function(task) {
          renderTask(task);
        },
        error: function() {
          context.trigger('error', {message: 'Sorry, could not save your task.'})
        }
      });
    }});
    
    get('#/connecting', function() { with(this) {
      render('text', '#tasks', '... Loading ...');
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