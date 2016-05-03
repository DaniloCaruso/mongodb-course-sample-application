var bodyParser = require('body-parser');
var express = require('express');
var status = require('http-status');

module.exports = function(wagner){

	var api = express.Router();

	api.use(bodyParser.json());
//------------------------USER API-------------------------------------------

	api.put('/me/cart', wagner.invoke(function(User){
		return function(request , response){
			try{
				var cart = request.body.data.cart;
			}catch(e){
				return response.status(status.BAD_REQUEST).
				json({ error: 'No cart specified!'});
			}

			request.user.data.cart = cart;
			request.user.save(function(error , user){
				if (error){
					return res.status(status.INTERNAL_SERVER_ERROR)
					.json({ error: error.toString() });
				}
				return res.json({ user: user });
			});
		};

	}));

//------------------------/USER API------------------------------------------


//------------------------PRODUCT API----------------------------------------
	api.get('/product/id/:id', wagner.invoke(function(Product){
		return function(request , response){
			Product.findOne({_id: request.params.id}, 
				handleOne.bind(null , 'product' , response)
				);
		};
	}));

	api.get('/product/category/:id' , wagner.invoke(function(Product){
		return function(request , response){
			var sort = { name:1 };
			if(request.query.price === "1"){
				sort = {'internal.approximatePriceUSD' : 1};
			}
			else if(request.query.price === "-1"){
				sort = {'internal.approximatePriceUSD' : -1};
			}
			Product.find({ 'category.ancestors': request.params.id}).
			sort(sort).
			exec(handleMany.bind(null , 'products',response));
		};
	}));
//------------------------/PRODUCT API---------------------------------------

//------------------------CATEGORY API---------------------------------------
	api.get('/category/id/:id' , wagner.invoke(function(Category){
		return function(request , response){
			Category.findOne({ _id: request.params.id}, 
				handleOne.bind(null , 'category' , response)
				);
		};
	}));

	*/api.get('/category/parent/:id', wagner.invoke(function(Category){
		return function(request , response){
			Category.find({ parent: request.params.id })
			.sort({_id:1 })
			.exec(function(error, categories){
				if(error){	
					return response.status(status.INTERNAL_SERVER_ERROR)
					.json({ error: error.toString});
				}

				response.json({categories : categories});
			});
		}

	}));*/

	api.get('/category/parent/:id', wagner.invoke(function(Category){
		return function(request , response){
			Category.find({ parent: request.params.id })
			.sort({_id:1 })
			.exec(handleMany(null ,'categories' , response));
		};

	}));
//------------------------/CATEGORY API--------------------------------------


//------------------------UTILITY-HELPERS------------------------------------
	function handleOne(property , response , error , result){
		if(error){	
			return response.status(status.INTERNAL_SERVER_ERROR)
			.json({ error: error.toString});
		}
		if(!result){
			return response.status(status.NOT_FOUND)
			.json({error: 'Not Found!'});
		}
		var jsonResponse = {};
		jsonResponse[property] = result;
		response.json(jsonResponse);
	};

	function handleMany(property , response , error , result){
		if(error){	
			return response.status(status.INTERNAL_SERVER_ERROR)
			.json({ error: error.toString});
		}
		
		var jsonResponse = {};
		jsonResponse[property] = result;
		response.json(jsonResponse);
	};
//------------------------/UTILITY-HELPERS-----------------------------------

	return api;
};