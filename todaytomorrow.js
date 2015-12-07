// Today / Tomorrow plugin
// author: mstrnal 2015

// Router.route('/', function () {
//   this.render('todaytomorrow');
// });

// Router.route('/login', function () {
//   this.render('login');
// });

// Router.route('/history', function () {
//   this.render('history');
// });


// establish db collection of items
Todos = new Mongo.Collection('todos');


// Get today's date
function getTodayUtc(){
  var today = new Date().toDateString();
  return new Date(today).getTime();
}

// get tomorrow's date
function getTomorrowUtc(){
  var today = new Date().toDateString();
  return new Date(today).getTime() + 86400000;
}


// =================================================
// Frontend Client side functionality
// =================================================
if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("todos");
  
  // helpers for diplaying the whole page
  Template.main.helpers({
    
    // only gets the tasks set to be completed today and belong to a specific user
    todostoday:  function () {
      console.log("todays list");
      var list = Todos.find(
          { dateComplete: {$lte: getTodayUtc() }, owner: Meteor.userId() },
          { sort: {dateCreate: 1} }
        );

      console.log(list);
      return list;
    }, 

    // gets tasks set to be completed in the 'future' and belong to a specific user
    todostomorrow:  function () {
      var list = Todos.find(
          { dateComplete: {$gt: getTodayUtc() }, owner: Meteor.userId() },
          { sort: {dateCreate: 1} }
        );

      //console.log(list);
      return list;
    }, 

    hideCompleted: function (){
      return Session.get("hideCompleted");
    }, 

    dateToday: function () {
      //return getTodayUtc();
      console.log('hi');
      return new Date(getTodayUtc()).toDateString();
    },

    dateTomorrow: function() {
      //return getTomorrowUtc();
      return new Date(getTomorrowUtc()).toDateString();
    }, 
    
    getUsername: function(){
      return Meteor.user().email;
    } 

  });

  // event listenters for the entire page
  Template.main.events({

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
    },
    
    'click .logout': function (event){
      console.log('logging out');
      Meteor.logout();
      //showLogin();
      return false;
    }

  });

  Template.login.helpers({
    'show': function(){
      var element = $('#login-sign-in-link');
      console.log(element);
      $('#login-sign-in-link').click();
      
    }
  });
 
  // event listeners for individual events
  Template.item.events({
    // Event: complete task
    'click .complete': function () {
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
      //return true;
      return this.owner === Meteor.userId();
    }, 

    listName: function() {
      if (this.dateComplete <= getTodayUtc()) {
        return 'today';
      }
      else {
        return 'tomorrow';
      }
    },

    completed: function(){
      return this.isCompleted;
    }
  });

  // Accounts.ui.config({
  //   passwordSignupFields: "USERNAME_ONLY"
  // });

}

// =================================================
// Backend Server Functionality
// =================================================
if(Meteor.isServer){
  Meteor.publish('todos', function () {
    // console.log(this.userId);
    //console.log(Todos.find({ owner: this.userId }));
    return Todos.find({ owner: this.userId });
  });
}

// =================================================
// Data Layer Methods - update items in db
// =================================================
Meteor.methods({
  addItem: function (text, completeDate) {
    console.log("in adding item");
    if(!Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    var newItem = {
        text: text,   // text that shows to the user
        dateCreate: new Date(), // allows for ordering and sorting 
        active: true,   // removes task from list ie. "deletes"
        dateComplete: completeDate,     // sets tast as crossed out
        owner: Meteor.userId(),
        isCompleted: false     // action done by the user 

         
        // username: Meteor.user().username
      };
      //console.log(newItem);
    Todos.insert(newItem);
  }, 

  removeItem: function (itemId){
    var item = Todos.findOne(itemId);
    // Validation check
    if( item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.remove(itemId);
  }, 

  setActive: function (itemId, isActive){
    var item = Todos.findOne(itemId);
    
    // Validation check
    if(item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.update(itemId, {$set: {active: isActive }});
  }, 

  setCompleted: function (itemId, setCompleted){
    var item = Todos.findOne(itemId);
    
    // Validation check
    if(item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.update(itemId, {$set: {isCompleted: setCompleted }});
  }, 

  moveDays: function (itemId, dayToMove){
    var item = Todos.findOne(itemId);
    
    // Validation check
    if(item.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }

    Todos.update(itemId, {$set: {dateComplete: dayToMove }});
  }
  
});


// VISUAL HELPERS



