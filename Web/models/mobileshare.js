var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var mobileshareSchema=mongoose.Schema({
                user_id:{
                    type:String
                },
                match_id:{
                    type:String
                },
                status:{
                    type:String,
                    default:'0'
                }

});

var MobileShare = module.exports = mongoose.model('MobileShare', mobileshareSchema);

