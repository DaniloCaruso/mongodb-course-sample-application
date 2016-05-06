var StripeModule = require('stripe');

function stripeInitialization(wagner){
	var stripe = StripeModule(process.env.STRIPE_API_KEY);

	wagner.factory('Stripe' , function(){
		return stripe
	});
	return{ Stripe: stripe };
};

module.exports = stripeInitialization;