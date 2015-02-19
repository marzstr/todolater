// simple-todos.js

Todos = new Mongo.Collection('todos');

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("todos");
  
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

  Template.body.events({

    // Event: add new task to list
    'submit .new-task': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_text').val();

      Meteor.call("addItem", text);

      //event.target.text.value = "";
      $('#new_task_text').val('');

      return false; // must return false to prevent default form submmit
    }, 

    'change .hide-completed input': function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.item.events({
    // Event: complete task
    'click .toggle-checked': function () {
      Meteor.call("setChecked", this._id, !this.checked);
    },

    'click .delete': function (){
      Meteor.call("removeItem", this._id);
    }, 

    'click .toggle-private': function () {
      Meteor.call("setPrivate", this._id,  ! this.private);
    }
  });

  Template.item.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

if(Meteor.isServer){
  Meteor.publish('todos', function () {
    return Todos.find({
      $or: [
        {private: {$ne: true}},
        {owner: this.userId }
      ]
    });
  });
}

Meteor.methods({
  addItem: function (text) {
    if(!Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    Todos.insert({
        text: text,
        createdAt: new Date(), 
        owner: Meteor.userId(),
        username: Meteor.user().username
      });
  }, 

  removeItem: function (itemId){
    var item = Todos.findOne(taskId);

    // Validation check
    if(item.private && item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.remove(itemId);
  }, 

  setChecked: function (itemId, setChecked){
    var item = Todos.findOne(taskId);
    
    // Validation check
    if(item.private && item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.update(itemId, {$set: {checked: setChecked }});
  }, 

  setPrivate: function (itemId, setToPrivate){
    var item = Todos.findOne(itemId);

    if(task.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    } 

    Todos.update(itemId, { $set: { private: setToPrivate }});
  }
});




