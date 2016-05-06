var assert = require('assert');
var express = require('express');
var status = require('http-status');
var superagent = require('superagent');
var wagner = require('wagner-core');

var URL_ROOT = 'http://localhost:3000';

describe('The Category API', function(){

	var server;
	var Category;
	

	before(function(){
		var app = express();

		//Bootstrap Server
		models = require('../models/model')(wagner);
		app.use(require('../srv/api')(wagner));

		server = app.listen(3000);
		//make Category model available in the tests
		Category = models.Category;
	});

	after(function(){
		//shut down server when we're done
		server.close();
	});

	beforeEach(function(done){
		//Make sure categorieas are empty before each state
		
		Category.remove({}, function(error){
			assert.ifError(error);
			done();
		});

	});

	it('can load a category by id', function(done){
		// Creiamo una singola categoria

		Category.create({ _id: 'Electronics' }, function(error , category){
	
			assert.ifError(error);

			var url = URL_ROOT + '/category/id/Electronics';
			// Faccio una chiamata a 
			// http://localhost:3000/category/id/Electronics

			superagent.get(url, function(error,res){

				Console.log('effettuata la get di '+ url)
				done();
				assert.ifError(error);
				
				var result;
				// Mi assicuro che il risultato sia {_id : 'Electronics'}
				assert.doesNotThrow(function(){
					result = JSON.parse(res.text);
				});
				assert.ok(result.category);
				assert.equal(result.category._id, 'Electronics');
				done();				
			});
		});
	});

	it('can load all categories that have a certain parent', function(done){
		var categories=[
		{ _id: 'Electronics' },
		{ _id: 'Phones' , parent:'Electronics' },
		{ _id: 'Laptops' , parent:'Electronics' },
		{ _id: 'Bacon' }
		];

		//create 4 categories
		Category.create(categories, function(error , categories){
			var url = URL_ROOT + '/category/parent/Electronics';
			//using superagent for make the HTTP call
			superagent.get(url, function(error , res){
				assert.ifError(error);
				var result;
				assert.doesNotThrow(function(){
					result= JSON.parse(res.text);
				});

				assert.equal(result.categories.length, 2);
				done();

			});
		});
	});

});