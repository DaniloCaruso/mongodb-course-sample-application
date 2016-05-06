var bodyParser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _  = require('underscore');

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

	/*api.get('/category/parent/:id', wagner.invoke(function(Category){
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

//------------------------CHECKOUT API---------------------------------------
api.post('/checkout',wagner.invoke(function(User , Stripe){
	return function(request , response){
		if(!request.user){
			return response.status(status.UNAUTHORIZED).
			json({error: 'Not Logged in!'});
		}

		request.user.populate({path: 'data.cart.product' , model: 'Product' }, function(error , user){

			var totalCostUSD = 0;
			//SUM ALL PRODUCT PRICE IN USD
			_.each(user.data.cart, function(item){
				totalCostUSD += item.product.internal.approximatePriceUSD * item.quantity
			});


			//AND CREATE A CHARGE IN STRYPE CORRESPONDING TO THE PRICE
			Stripe.charge.create(
				{
					//STRIPE WANTS THE PRICE IN CENTS SO MULTIPLY BY 100 AND ROUND UP
					amount:MATH.ceil(totalCostUSD*100),
					currency: 'usd',
					source: request.body.stripeToken,
					description: 'Payment Example'
				},
				function(error, charge){
					if(error && error.type === 'StripeCardError'){
						return response.status(status.BAD_REQUEST).
						json({ error: error.toString() });
					}
					if (error) {
						 console.log(error);
						 return response.status(status.INTERNAL_SERVER_ERROR).
						 json({ error: error.ToString()});
					}

					req.user.data.cart = [];
					request.user.save(function() {
						//IGNORE ANY ERRORS IF THE USER CART 
						//FAILURE TO EMPTY IT'S NOT NECESSARILY AN ERROR

						//IF SUCCESSFULL , RETURN THE CHARGE ID
						return res.json({id:charge.id});
					});
				}
			);

		});
	}
}));
//------------------------/CHECKOUT API--------------------------------------

//------------------------TEXT-SEARCH API------------------------------------
api.get('/product/text/_query', wagner.invoke(function(Product){
	return function(request , response){
		Product.find({ $text : { $search : request.params.query }},
			{ score : { $meta : 'textScore'	}}).
		sort({ score: {$meta: 'textScore'} }).limit(10).
		exec(handleMany.bind(null , 'products', response));
		};
}));
//------------------------/TEXT-SEARCH API-----------------------------------

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