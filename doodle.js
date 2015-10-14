// ROUTING
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.route('/register');
Router.route('/pollForm');
Router.route('/polls');

Router.route('/poll/:_id', {
  template: 'pollPage',
    data: function(){
      var currentPoll = this.params._id;
      return PollsList.findOne({ _id: currentPoll});
    }
});


Router.configure({
    layoutTemplate: 'layout'
});


// MAIN APP

PollsList = new Mongo.Collection('polls');
UsersList = new Mongo.Collection('users');

// this function return true if there is
// an empty string in the array, otherwise
// returns false
var thereIsAnEmptyString = function(strArr){
  for (i in strArr)
    if(strArr[i] === "")
      return true;
  return false;
};

var insertDate = function(day, time){
  var dayHtml = '<td class="day">' + day + '</td>';
  var timeHtml = '<td class="time">' + time + '</td>';
  var html = '<tr class="date">' + dayHtml + timeHtml + '</tr>'
  $(html).appendTo('#datesBoard');
};

if(Meteor.isClient){
  // this code only runs on the client
  Template.polls.helpers({
    'poll': function(){
      return PollsList.find();
    }
  });

  Template.pollPage.helpers({
    'user': function(){
      console.log("ID: " + this._id);
      console.log(UsersList.find({insertedIn: this._id}).fetch());
      return UsersList.find({insertedIn: this._id});
    },
    'date': function(){
      console.log("DATE ID:" +  this._id);
      var currentPoll = '"' + this._id + '"';
      return PollsList.find();
    }
  });

  Template.pollPage.events({
    'click [type="submit"]': function(event){
      event.preventDefault();
      var userNameVar = $("#userName").val();
      var selectedDates = [];
      $(".dateCheckbox").each(function(index){
        selectedDates.push($(this).is(':checked'));
        $(this).attr('value', false)
      });
      console.log("selectedDates: " + selectedDates);
      var pollId = this._id;
      console.log("id: " + pollId);
      UsersList.insert({
        name: userNameVar,
        dates: selectedDates,
        insertedIn: pollId
      });
      // Reset form
      $("#userName").val('');
    }
  });

  Template.addUserForm.helpers({
    'date': function(){
      console.log(this._id);
      return PollsList.find().fetch()[0].dates;
    }
  });

  Template.pollForm.events({
    'submit form': function(event){
      event.preventDefault();
      var eventName = event.target.eventName.value;
      var userName = event.target.userName.value;
      if(thereIsAnEmptyString([eventName, userName])){
        alert("There is some empty field!");
        return false;
      }
      var dates = [];
      $('.day').each(function(index, element){
        //console.log("element: '" + $(this).text() + "'");
        dates.push({day: $(this).text()});
      });
      $('.time').each(function(index, element){
        //console.log("element: '" + $(this).text() + "'");
        dates[index].time = $(this).text();
      });
      if(dates.length<=0){
        alert("You must select at least one day and time");
        return false;
      }else{
        PollsList.insert({
          title: eventName,
          createdBy: userName,
          dates: dates
        });
      }
      Router.go('polls');
    },
    'click #addDate': function(event){
      event.preventDefault();
      var day = $("#my-datepicker").val();
      var time = $('[name="time"]').val();
      $("#my-datepicker").val("");
      $('[name="time"]').val("");
      if(thereIsAnEmptyString([day, time]))
        alert('You must set a day and a time');
      else
        insertDate(day, time);
   },
  });

  Template.pollForm.rendered=function() {
      $('#my-datepicker').datepicker({
        format: "dd/mm/yyyy"
      });
  }
}
if(Meteor.isServer){
  // this code only runs on the client
}