// Today / Tomorrow plugin
// author: mstrnal 2015

// establish db collection of items
Todos = new Mongo.Collection('todos');


// =================================================
// Frontend Client side functionality
// =================================================
if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("todos");
  
  // helpers for diplaying the whole page
  Template.body.helpers({

    todos:  function () {

      if(Session.get("hideCompleted")){
        return Todos.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        return Todos.find({}, {sort: { createdAt: -1 }});
      }
      
    }, 
    hideCompleted: function (){
      return Session.get("hideCompleted");
    }, 
    incompleteCount:function () {
      return Todos.find({checked: {$ne: true}}).count();
    }, 
      
  });

  // event listenters for the entire page
  Template.body.events({

    // Event: add new task to list
    'submit .new-task': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_today').val();
      console.log(text);

      Meteor.call("addItem", text);

      //event.target.text.value = "";
      $('#new_task_text').val('');

      return false; // must return false to prevent default form submmit
    }, 

    'change .hide-completed input': function (event) {
      Session.set("hideCompleted", event.target.checked);
    },

    'submit .new-task': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_tomorrow').val();
      console.log(text);

      Meteor.call("addItem", text);

      //event.target.text.value = "";
      $('#new_task_text').val('');

      return false; // must return false to prevent default form submmit
    }
  });

  // event listeners for individual events
  Template.item.events({
    // Event: complete task
    'click .toggle-checked': function () {
      Meteor.call("setChecked", this._id, !this.checked);
    },

    'click .delete': function (){
      //console.log(this._id);
      Meteor.call("removeItem", this._id);
    }, 

    'click .toggle-private': function () {
      Meteor.call("setPrivate", this._id,  ! this.private);
    }
  });

  // templatting helpers for displaying items
  Template.item.helpers({
    isOwner: function () {
      return true;
      //return this.owner === Meteor.userId();
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

// =================================================
// Backend Server Functionality
// =================================================
if(Meteor.isServer){
  Meteor.publish('todos', function () {
    return Todos.find({
      $or: [
        {private: {$ne: true}}
        // ,
        // {owner: this.userId }
      ]
    });
  });
}

// =================================================
// Data Layer Methods - update items in db
// =================================================
Meteor.methods({
  addItem: function (text) {
    // if(!Meteor.userId()){
    //   throw new Meteor.Error("not-authorized");
    // }

    Todos.insert({
        text: text,
        createdAt: new Date(),
        active: true
        // owner: Meteor.userId(),
        // username: Meteor.user().username
      });
  }, 

  removeItem: function (itemId){
    var item = Todos.findOne(taskId);
    console.log(item);
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.remove(itemId);
  }, 

  setChecked: function (itemId, setChecked){
    var item = Todos.findOne(taskId);
    
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.update(itemId, {$set: {checked: setChecked }});
  }, 

  setPrivate: function (itemId, setToPrivate){
    var item = Todos.findOne(itemId);

    // if(task.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // } 

    Todos.update(itemId, { $set: { private: setToPrivate }});
  }
});




