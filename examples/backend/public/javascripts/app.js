;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    var db = null;
    
    // display tasks
    get('#/', function() { with (this) {
      $.each(db.collection('tasks').all(), function(i, task) {
        $('#tasks').append(task.entry);
      });
    }});
    
    bind('run', function() {
      this.log('running!', this);
    });
    
    bind('run', function() {
      var context = this;
      if (!db) db = $.cloudkit;
      db.boot({
        success: function() {
          context.trigger('db-loaded');
        },
        failure: function() {
          context.trigger('error', {message: 'Could not connect to CloudKit.'})
        }
      })
    });
    
    bind('db-loaded', function() {
      this.redirect('#/')
    });
    
    bind('error', function(e, data) {
      $('#error').text(data.message).show();
    });
    
  }});
  
  $(function() {
    app.addLogger(function(e, data) {
      $('#debug').append([app.toString(), e.cleaned_type, data, '<br />'].join(' '));
    })
    app.run();
  })
})(jQuery);

