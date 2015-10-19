describe("List adding", function () {
  beforeEach(function (done) {
    Meteor.loginWithPassword("pepe@gmail.com", "123456", function(err){
      Tracker.afterFlush(done);
    });
  });

  afterEach(function (done){
    Meteor.logout(function() {
      Tracker.afterFlush(done);
    });
  });

  it("should find new added list in the collection", function () {
    var listName = "listX";
    var userId = Meteor.userId();

    $("[name=listName]").val(listName);
    $("form.addList").submit();

    setTimeout(function () {
      expect(Lists.findOne({name: listName, 
                            createdBy: userId})).toBeTruthy();
      done();
    }, 25);
  });
});