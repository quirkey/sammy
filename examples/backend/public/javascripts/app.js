;(function($) {
  var app = $.sammy('#main', function() {
    this.debug = true;
    this.use(Sammy.Cache);
    this.use(Sammy.Template, 'erb');

    var db = null,
        db_loaded = false;

    this.before(function() {
      if (!db_loaded) {
        this.redirect('#/connecting');
        return false;
      }
    });

    // display tasks
    this.get('#/', function(context) {
      this.partial('/templates/index.html.erb', function(html) {
        $('#main').html(html);
        $.each(db.collection('tasks').all(), function(i, task) {
          context.log('task', task.json());
          context.partial('/templates/task.html.erb', {task: task}, function(task_html) {
            $(task_html).data('task', task).prependTo('#tasks');
          });
        });
      });
    });

    this.get('#/tasks/:id', function() {
      this.task = db.collection('tasks').get(this.params['id']).json();
      this.partial('/templates/task_details.html.erb')
    });

    this.post('#/tasks', function(context) {
      var task  = {
        entry: this.params['entry'],
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
    });

    this.get('#/connecting', function() {
      $('#main').html('<span class="loading">... Loading ...</span>');
    });

    this.bind('task-toggle', function(e, data) {
      this.log('data', data)
      var $task = data.$task;
      this.task = db.collection('tasks').get($task.attr('id'));
      this.task.attr('completed', function() { return (this == true ? false : true); });
      this.task.update({}, {
        success: function() {
          $task.toggleClass('completed');
        }
      });
    });

    this.bind('run', function() {
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

    this.bind('db-loaded', function() {
      this.redirect('#/')
    });

    this.bind('error', function(e, data) {
      $('#error').text(data.message).show();
    });


  });

  $(function() {
    app.run('#/');
  })
})(jQuery);
