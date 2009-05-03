;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    
    // display tasks
    get('#/', function() { with (this) {
      $.each(db.collection('tasks').all(), function(i, task) {
        $('#tasks').append(task.entry);
      });
    }});
    
    bind('run', function() {
      this.log('running!', this);
    });
    
    // before(function() {
    //   alert('here');
    //   var app = this;
    //   if (app.db == 'undefined') app.db = $.cloudkit;
    //   app.db.boot({
    //     success: function() {
    //       app.trigger('db-loaded');
    //     },
    //     failure: function() {
    //       app.trigger('error', {message: 'Could not connect to CloudKit.'})
    //     }
    //   })
    // });
    // 
    // bind('db-loaded', function() {
    //   this.runRoute('get', '#/')
    // });
    
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

