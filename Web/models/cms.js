var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

// Admin Schema
var cmsSchema = mongoose.Schema({
    type: {
        type: String
    },
    content: {
        type: String
    },
    date: { 
        type:String
    }

});
var Cms = module.exports = mongoose.model('Cms', cmsSchema);

