describe("DOM elements with user logged in", function () {

  beforeEach(function (done) {
    Meteor.loginWithPassword("pepe@gmail.com", "123456", function(err){
      Tracker.afterFlush(done);
    });
  });

  it("should be able to create a new list", function(){
    var addListSubmit = $("[name='listName']");
    expect(addListSubmit.length).toBe(1);
  });

  it("should be able to logout", function(){
    var logoutAnchor = $("[class='logout']");
    expect(logoutAnchor.length).toBe(1);
  });

  it("shouldn't be able to login nor register", function(){
    var loginAnchor = $("a.login");
    var registertAnchor = $("a.register");
    var length = loginAnchor.length + registertAnchor.length;
    expect(length).toBe(0);
  });
});