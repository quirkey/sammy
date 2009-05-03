;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    
    var db, db_loaded;
    db = null;
    db_loaded = false;
    
    before(function() { with(this) {
      if (!db_loaded) {
        redirect('#/connecting');
      }
    }});
    
    // display tasks
    get('#/', function() { with (this) {
      if (!db_loaded) return false;
      $('#tasks').html('');
      $.each(db.collection('tasks').all(), function(i, task) {
        $('#tasks').append('<li>' + task.json().entry + '</li>');
      });
    }});
    
    post('#/tasks', function() { with(this) {
      if (!db_loaded) return false;
      var context = this;
      db.collection('tasks').create({entry: params['entry']}, {
        success: function(task) {
          context.log('created', task.json());
          $('#tasks').append(task.json().entry);
        },
        error: function() {
          context.trigger('error', {message: 'Sorry, could not save your task.'})
        }
      })
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
      })
    });
    
    bind('db-loaded', function() { with(this) {
      redirect('#/')
    }});
    
    bind('error', function(e, data) { with(this) {
      render('text', '#error', data.message).show();
    }});
    
  }});
  
  $(function() {
    // app.addLogger(function(e, data) {
    //   $('#debug').append([app.toString(), e.cleaned_type, data, '<br />'].join(' '));
    // })
    app.run('#/');
  })
})(jQuery);

