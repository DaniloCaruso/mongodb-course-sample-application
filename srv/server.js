var express = require('express');

module.exports= function(){
	var app = express();

	app.get('/', function(request,response){
		response.send('Hello World');
	});

	app.get('/user/:user' , function(request,response){
		response.send("Page for user " + request.params.user + " with options: " + request.query.options);
	});

	return app;
};