// Today / Tomorrow plugin
// author: mstrnal 2015

// establish db collection of items
Todos = new Mongo.Collection('todos');


// Get today's date
function getTodayUtc(){
  var now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDay());
}

// get tomorrow's date
function getTomorrowUtc(){
  return getTodayUtc() + 86400000;
}

// =================================================
// Frontend Client side functionality
// =================================================
if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("todos");
  
  // helpers for diplaying the whole page
  Template.body.helpers({

    todostoday:  function () {
      var list = Todos.find(
          { dateComplete: {$lte: getTodayUtc() } },
          { sort: {dateCreate: -1} }
        );

      console.log(list);
      return list;
    }, 

    todostomorrow:  function () {
      var list = Todos.find(
          { dateComplete: {$gt: getTodayUtc() } },
          { sort: {dateCreate: -1} }
        );

      console.log(list);
      return list;
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
    'submit .today': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_today').val();
      console.log(text);

      Meteor.call("addItem", text, getTodayUtc());

      //event.target.text.value = "";
      $('#new_task_today').val('');

      return false; // must return false to prevent default form submmit
    }, 

    // create a new task for tomorrow list
    'submit .tomorrow': function (event){

      //var text = event.target.text.value;
      var text = $('#new_task_tomorrow').val();
      console.log(text);

      Meteor.call("addItem", text, getTomorrowUtc());

      //event.target.text.value = "";
      $('#new_task_tomorrow').val('');

      return false; // must return false to prevent default form submmit
    }

  });

  // event listeners for individual events
  Template.item.events({
    // Event: complete task
    'click .toggle-checked': function () {
      Meteor.call("setCompleted", this._id, !this.isCompleted);
    },

    'click .delete': function (){
      //console.log(this._id);
      Meteor.call("removeItem", this._id);
    }, 

    'click .move-today': function () {
      Meteor.call("moveDays", this._id, getTomorrowUtc() );
    }, 

    'click .move-tomorrow': function () {
      Meteor.call("moveDays", this._id, getTodayUtc() );
    }

  });

  // templatting helpers for displaying items
  Template.item.helpers({
    isOwner: function () {
      return true;
      //return this.owner === Meteor.userId();
    }, 

    listName: function() {
      if (this.dateComplete <= getTodayUtc()) {
        return 'today';
      }
      else {
        return 'tomorrow';
      }
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
      // $or: [
      //   {private: {$ne: true}}
      //   // ,
      //   // {owner: this.userId }
      // ]
    });
  });
}

// =================================================
// Data Layer Methods - update items in db
// =================================================
Meteor.methods({
  addItem: function (text, completeDate) {
    // if(!Meteor.userId()){
    //   throw new Meteor.Error("not-authorized");
    // }

    Todos.insert({
        text: text,   // text that shows to the user
        dateCreate: new Date(), // allows for ordering and sorting 
        active: true,   // removes task from list ie. "deletes"
        dateComplete: completeDate,     // sets tast as crossed out
        isCompleted: false     // action done by the user 

        // owner: Meteor.userId(),
        // username: Meteor.user().username
      });
  }, 

  removeItem: function (itemId){
    var item = Todos.findOne(itemId);
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.remove(itemId);
  }, 

  setActive: function (itemId, isActive){
    var item = Todos.findOne(itemId);
    
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.update(itemId, {$set: {active: isActive }});
  }, 

  setCompleted: function (itemId, setCompleted){
    var item = Todos.findOne(itemId);
    
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.update(itemId, {$set: {isCompleted: setCompleted }});
  }, 

  moveDays: function (itemId, dayToMove){
    var item = Todos.findOne(itemId);
    
    // Validation check
    // if(item.private && item.owner !== Meteor.userId()){
    //   throw new Meteor.Error('not-authorized');
    // }

    Todos.update(itemId, {$set: {dateComplete: dayToMove }});
  }
  
});




