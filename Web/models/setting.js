var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

// User Schema
var settingSchema=mongoose.Schema({
                distance:{
                    type:String,
                    default:804672
                },
                seeking:{
                    type:String,
                    default:'Both'
                },
                user_id:{
                    type:String
                }
});
var Setting = module.exports = mongoose.model('Setting', settingSchema);

