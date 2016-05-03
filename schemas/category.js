var mongoose = require('mongoose');

// _id è sia il nome che l'id
// parent è il padre diretto della categoria
// ancestors sono gli antenati della categoria
var categorySchema = {
	_id: {type:String},
	parent: {
		type:String,
		ref:'Category'
	},
	ancestors:[{
		type:String,
		ref:'Category'
	}]
};

module.exports = mongoose.Schema(categorySchema);
module.exports.categorySchema = categorySchema;