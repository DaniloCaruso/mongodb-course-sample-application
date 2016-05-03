var mongoose = require('mongoose');
var Category = require('./category');
var actualExchange = require('./exchange/actual-exchange');

var productSchema = {
	name:{ type:String , required:true },
	pictures:[{ type:String, match:/^http:\/\//i }],
	price:{
		amount:{ 
			type: Number , 
			required:true ,
			set: function(value){
				this.internal.approximatePriceUSD = 
				value / (actualExchange()[this.price.currency] || 1);
				return value;
			}
		},
		currency:{
			type:String,
			enum:['USD', 'EUR' , 'GBP'],
			required:true,
			set: function(value){
				this.internal.approximatePriceUSD = 
				this.price.amount / (actualExchange()[value] || 1);
				return value
			}
		}
	},
	category: Category.categorySchema,
	internal:{
		approximatePriceUSD: Number
	}

};

var schema = new mongoose.Schema(productSchema);


var currencySymbols = {
	'USD' : '$',
	'EUR' : '€',
	'GBP' : '£'
};

//Human-readable string form of price 
schema.virtual('displayPrice').get(function(){
return currencySymbols[this.price.currency]+this.price.amount;
});

schema.set('toObject' 	, {virtuals:true});
schema.set('toJson' 	, {virtuals:true});

module.exports = schema;