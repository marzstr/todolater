// simple-todos.js

Todos = new Mongo.Collection('todos');

if (Meteor.isClient) {
  // This code only runs on the client
  
  Template.body.helpers({
    todos:  function () {
      return Todos.find({}, {sort: { createdAt: -1 }});
    }
      
  });

  Template.body.events({

    // Event: add new task to list
    'submit .new-task': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_text').val();

      console.log(text);

      Todos.insert({
        text: text,
        createdAt: new Date()
      });

      //event.target.text.value = "";
      $('#new_task_text').val('');

      return false; // must return false to prevent default form submmit
    }
  });

  Template.item.events({
    // Event: complete task
    'click .toggle-checked': function () {
      Todos.update(this._id, {$set: {checked: ! this.checked }});
    },

    'click .delete': function (){
      Todos.remove(this._id);
    }
  });
  
}