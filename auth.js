function setupAuth(User , app){
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;


passport.serializeUser(function(user , done){
	done(null, user._id);
});

passport.deserializeUser(function(id , done){
	User.findOne({_id : id }).
	exec(done);
});



passport.use(new GitHubStrategy({

    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET_ID,
    callbackURL: "http://localhost:3000/auth/github/callback"

  },
  function(accessToken, refreshToken, profile, done) {
 	debugger
    if(!profile._json.email){
    	return done('No emails associated with this account!');
    }
	debugger
    User.findOneAndUpdate({'data.oauth':profile.id.toString()},
    	{
    		$set:
    			{
    				'profile.username': profile.username.toString(),
    				'profile.picture':profile.photos[0].value.toString()
    			}
    	},
    	{
    		'new':true,
    		upsert : true,

    		//runValidators:true

    	},
    	function(error , user){
    		debugger
    		done(error,user);
    	});
    }));

 //ESPRESS MIDDLEWARE
 debugger
 app.use(require('express-session')({secret:'this is a secret'}));
 app.use(passport.initialize());
 app.use(passport.session());

 //ESPRESS ROUTE FOR AUTH
 app.get('/auth/github',
 	passport.authenticate('github',{scope: ['email']}));

 app.get('/auth/github/callback',
 	passport.authenticate('github', {failureRedirect: '/fail'}),
 	function(request , response){
 		debugger
 		response.send('Welcome,' + request.user.profile.username)
 	});


}

module.exports = setupAuth;

