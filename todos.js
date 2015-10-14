/**
*
* ROUTERS
*
*/

Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});

Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.route('/list/:_id', {
  name: 'listPage',
  template: 'listPage',
  data: function(){
    var currentUser = Meteor.userId();
    var currentList = this.params._id;
    return Lists.findOne({_id:currentList, createdBy:currentUser});
  },
  onBeforeAction: function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next();
    } else {
      this.render("login");
    }
  },
  subscriptions: function(){
    var currentList = this.params._id;
    return Meteor.subscribe('todos', currentList)
  },
  waitOn: function(){
    var currentList = this.params._id;
    return Meteor.subscribe('todos', currentList);
  }
});


/**
*
* METEOR APP
*
*/

// COLLECTIONS
Todos = new Meteor.Collection('todos');
Lists = new Meteor.Collection('lists');


if(Meteor.isClient){
  Template.todos.helpers({
    'todo': function(){
      var currentUser = Meteor.userId();
      var currentList = this._id;
      return Todos.find({listId:currentList, createdBy:currentUser},
                        {sort:{createdAt:-1}});
    }
  });

  Template.addTodo.events({
    'submit form': function(event){
      event.preventDefault();
      var todoName = $('[name="todoName"]').val();
      var currentList = this._id;
      Meteor.call('createListItem', todoName, currentList, function(error){
        if(error){
          console.log(error.reason);
        } else {
          $('[name="todoName"]').val('');
        }
      });
    }
  });

  Template.todoItem.events({
    'click .delete-todo': function(event){
      event.preventDefault();
      var documentId = this._id;
      var confirm = window.confirm("Delete this task?");
      if(confirm){
        Meteor.call('removeListItem', documentId);
      }
    },
    'keyup [name=todoItem]': function(event){
      if(event.which == 13 || event.which == 27){
          $(event.target).blur();
      } else {
          var documentId = this._id;
          var todoItem = $(event.target).val();
          Meteor.call('updateListItem', documentId, todoItem);
      }
    },
    'change [type=checkbox]': function(){
      var documentId = this._id;
      Meteor.call('changeItemStatus', documentId, (!this.completed));
    }
  });

  Template.todoItem.helpers({
    'checked': function(){
      var isCompleted = this.completed;
      if(isCompleted)
        return "checked";
      else
        return "";
    }
  });

  Template.todosCount.helpers({
      'totalTodos': function(){
        var currentList = this._id;
        return Todos.find({listId:currentList}).count();
      },
      'completedTodos': function(){
        var currentList = this._id;
        return Todos.find({listId:currentList, completed:true}).count();
      }
  });

  Template.addList.events({
    'submit form': function(event){
      event.preventDefault();
      var listName = $('[name=listName]').val();
      Meteor.call('createNewList', listName, function(error, results){
        if(error){
          console.log(error.reason);
        } else {
          Router.go('listPage', { _id: results });
          $('[name=listName]').val('');
        }
      });
    }
  });

  Template.lists.helpers({
    'list': function(){
      var currentUser = Meteor.userId();
      return Lists.find({createdBy:currentUser}, {sort:{name:1}});
    }
  });

  Template.lists.onCreated(function () {
    this.subscribe('lists');
  });

  Template.navigation.events({
    'click .logout': function(event){
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.register.events({
    'submit form': function(event){
      event.preventDefault();
      /*var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Accounts.createUser({
        email: email,
        password: password
      }, function(error){
        if(error){
          console.log(error.reason); // Output error if registration fails
        } else {
          Router.go("home"); // Redirect user if registration succeeds
        }
      });*/
    }
  });

  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      /*var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function(error){
        if(error){
          console.log(error.reason);
        } else {
          var currentRoute = Router.current().route.getName();
          if(currentRoute == "login"){
            Router.go("home");
          }
        }
      });*/
    }
  });

  Template.register.onRendered(function(){
    var validator = $('.register').validate({
      submitHandler: function(event){
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
          email: email,
          password: password
        }, function(error){
          if(error){
            if(error.reason == "Email already exists."){
              validator.showErrors({
                email: "That email already belongs to a registered user."   
              });
            }
          } else {
            Router.go("home"); // Redirect user if registration succeeds
          }
        });
      }
    });
  });

  Template.login.onRendered(function(){
    var validator = $('.login').validate({
      submitHandler: function(event){
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
            if(error.reason == "User not found"){
              validator.showErrors({
                email: "That email doesn't belong to a registered user."   
              });
            }
            if(error.reason == "Incorrect password"){
              validator.showErrors({
                password: "You entered an incorrect password."    
              });
            }
          } else {
            var currentRoute = Router.current().route.getName();
            if(currentRoute == "login"){
              Router.go("home");
            }
          }
        });
      }
    });
  });

  $.validator.setDefaults({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      email: {
        required: "You must enter an email address.",
        email: "You've entered an invalid email address."
      },
      password: {
        required: "You must enter a password.",
        minlength: "Your password must be at least {0} characters."
      }
    }
  });
}

if(Meteor.isServer){
  /**
  *
  * PUBLISH
  *
  */
  Meteor.publish('lists', function(){
    var currentUser = this.userId;
    return Lists.find({createdBy:currentUser});
  });

  Meteor.publish('todos', function(currentList){
    var currentUser = this.userId;
    return Todos.find({ createdBy: currentUser, listId: currentList })
  });

  /**
  *
  * METHODS
  *
  */
  Meteor.methods({
    'createNewList': function(listName){
      // If listName is not a string
      // the rest of the cod won't execute
      check(listName, String);
      var currentUser = Meteor.userId();
      // If the user didn't pass any title
      if(listName == ""){
        listName = defaultName(currentUser);
      }
      var data = {
        name: listName,
        createdBy: currentUser
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      }
      return Lists.insert(data);
    },
    'createListItem': function(todoName, currentList){
      check(todoName, String);
      check(currentList, String);

      var currentUser = Meteor.userId();
      var data = {
        name: todoName,
        completed: false,
        createdAt: new Date(),
        createdBy: currentUser,
        listId: currentList
      }

      // Check if the user is logged in
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      }

      // Check if the user owns that list
      var currentList = Lists.findOne(currentList);
      if(currentList.createdBy != currentUser){
        throw new Meteor.Error("invalid-user", "You don't own that list.");
      }
      
      return Todos.insert(data);
    },
    'updateListItem': function(documentId, todoItem){
      check(todoItem, String);
      var currentUser = Meteor.userId();
      var data = {
        _id: documentId,
        createdBy: currentUser
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      }
      Todos.update(data, {$set: { name: todoItem }});
    },
    'changeItemStatus': function(documentId, status){
      check(status, Boolean);
      var currentUser = Meteor.userId();
      var data = {
        _id: documentId,
        createdBy: currentUser
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      }
      Todos.update(data, {$set: { completed: status }});
    },
    'removeListItem': function(documentId){
      var currentUser = Meteor.userId();
      var data = {
        _id: documentId,
        createdBy: currentUser
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      }
      Todos.remove(data);
    }
  });

  function defaultName(currentUser){
    var nextLetter = 'A';
    var nextName = 'List ' + nextLetter;
    while(Lists.findOne({name: nextName, createdBy:currentUser})){
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
      nextName = 'List ' + nextLetter;
    }
    return nextName;
  }
}
