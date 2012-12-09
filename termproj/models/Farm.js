var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var farmsdb = mongoose.createConnection('mongodb://192.168.1.118/farms');
var Farm = new Schema({
    name: String,
    city: String,
    state: String,
    lat: String,
    lng: String,
    certifications: [String]
});

farmsdb.on('error', console.error.bind(console, 'connection error:'));
farmsdb.once('open', function(){console.log("farmsdb ready!");});

module.exports = farmsdb.model('Farm', Farm);
