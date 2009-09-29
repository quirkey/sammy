;(function($) {
  var app = new Sammy.Application(function() { with(this) {
    element_selector = '#main';
    
    var db, db_loaded;
    db        = null;
    db_loaded = false;
                        
    before(function() { with(this) {
      if (!db_loaded) {
        redirect('#/connecting');
        return false;
      } 
    }});
    
    // display tasks
    get('#/', function() { with (this) {
      partial('/templates/index.html.erb', function(html) {
        $('#main').html(html);
        this.each(db.collection('tasks').all(), function(i, task) {
          this.log('task', task.json());
          this.partial('/templates/task.html.erb', {task: task}, function(task_html) {
            $(task_html).data('task', task).prependTo('#tasks');
          });
        });
      });
    }});
    
    get('#/tasks/:id', function() { with(this) {
      this.task = db.collection('tasks').get(params['id']).json();
      this.partial('/templates/task_details.html.erb')
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
          context.partial('/templates/task.html.erb', {task: task}, function(task_html) {
            $('#tasks').prepend(task_html);
          });
          // clear the form
          $('.entry').val('');
        },
        error: function() {
          context.trigger('error', {message: 'Sorry, could not save your task.'})
        }
      });
      return false;
    }});
    
    get('#/connecting', function() { with(this) {
      $('#main').html('<span class="loading">... Loading ...</span>');
    }});
    
    bind('task-toggle', function(e, data) { with(this) {
      this.log('data', data)
      var $task = data.$task;
      this.task = db.collection('tasks').get($task.attr('id'));
      this.task.attr('completed', function() { return (this == true ? false : true); });
      this.task.update({}, {
        success: function() {
          $task.toggleClass('completed');
        }
      });
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
      
      $('li.task :checkbox').live('click', function() {
        var $task = $(this).parents('.task');
        context.trigger('task-toggle', {$task: $task});
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
    app.run('#/');
  })
})(jQuery);