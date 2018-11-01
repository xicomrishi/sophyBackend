var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

// User Schema
var userSchema=mongoose.Schema({
                name:{
                    type:String
                },
                gender:{
                    type:String
                },
                dob:{
                    type:String
                },
                age:{
                    type:String
                },
                seeking:{
                    type:String
                },
                mobile:{
                    type:String
                },
                latitude:{
                    type:String
                },
                 longitude:{
                    type:String
                },
                images:{
                    type:String
                },
                date: { 
                    type:String
                      // type: Date,
                      // default: Date.now 
                },
                status:{
                    type:String,
                    default:'active'
                },
                profile:{
                    type:String,
                    default:'incompelte'
                },
                country:{
                    type:String
                },
                countrycode:{
                    type:String,
                    uppercase: true
                },
                 delete:{
                    type:String,
                    default:0
                },
                index:{
                    type:Number
                }
});
DataTable.configure({ verbose: true, debug : true });
mongoose.plugin(DataTable.init);
var User = mongoose.model('User', userSchema);
var MyModel = module.exports = require('mongoose').model('User');

