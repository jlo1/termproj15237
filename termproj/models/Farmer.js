var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var farmersdb = mongoose.createConnection('mongodb://192.168.1.118/farmers');
var Farmer = new Schema({
    username: String,
    password: String
});
Farmer.methods.validPassword = function(pwd){
    return this.password===pwd;
}
farmersdb.on('error', console.error.bind(console, 'connection error:'));
farmersdb.once('open', function(){console.log("farmersdb ready!");});

module.exports = farmersdb.model('Farmer', Farmer);
