describe("User logged in", function () {

  beforeEach(function (done) {
    Meteor.loginWithPassword("pepe@gmail.com", "123456", function(err){
      Tracker.afterFlush(done);
    });
  });

  afterEach(function(done){
    Meteor.logout(function(){
      Tracker.afterFlush(done);
    });
  });

   it("should the user be logged in", function(){
    var user = Meteor.user();
    expect(user).not.toBe(null);
  });
});