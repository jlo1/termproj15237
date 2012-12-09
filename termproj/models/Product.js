var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productsdb = mongoose.createConnection('mongodb://192.168.1.118/products');
var Product = new Schema({
    name: String,
    description: String,
    rating: Number,
    category: [String],
    farm: {type: Schema.ObjectId, ref: 'Farm'},
    price: [{String: Number}]

});
Product.methods.validPassword = function(pwd){
    return(this.password===pwd);
}
productsdb.on('error', console.error.bind(console, 'connection error:'));
productsdb.once('open', function(){console.log("productsdb ready!");});

module.exports = productsdb.model('Product', Product);
