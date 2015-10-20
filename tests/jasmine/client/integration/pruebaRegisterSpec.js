
describe("Making a new register ", function () {

  beforeEach(function(done){
 	 Meteor.logout(function(){
 	 	Tracker.afterFlush(done);
 	 });
  });

 it('should be able to find home anchor' , function(){
    expect($("a.home").length).toBeGreaterThan(0);
 });

 it('should be able to find register anchor' , function(){
    expect($("a.register").length).toBeGreaterThan(0);
 });

 describe ( " Register form" , function () {

		$("a.register").click();
		
		it("should be able to find email input", function(){
			setTimeout(function () {
				expect($("form.register input.email").length).toBeGreaterThan(0);
				done() ;
			}, 500);
		});

		it("should be able to find password input", function(){
			setTimeout(function () {
				expect($("form.register input.password").length).toBeGreaterThan(0);
				done() ;
			}, 500);
		});
});
    

 describe("Registering a new user" , function() {

	it ("Should the user be registered and logged in" , function() {
		$("a.register").click();
		
		setTimeout(function () {

			var mail = "doomie@gmail.com" ;
			var pass = "1234567890" ;

			$("form.register input.email").val(mail);
			$("form.register input.password").val(pass);

			spyOn(Accounts, "createUser").and.callThrough() ;

			$("form.register").submit();

			setTimeout(function () {
				expect(Accounts.createUser).toHaveBeenCalled();
				done() ;
			}, 500);

			done() ;

		}, 500);

	});

});

});
