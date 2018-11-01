var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

// User Schema
var questionSchema=mongoose.Schema({
                question:{
                    type:String
                },
                category:{
                    type:String,
                    lowercase: true,
                    trim: true
                },
                type:{
                    type:String,
                    lowercase: true,
                    trim: true
                },
                owner:{
                    type:String,
                    default:''
                },
                option1:{
                    type:String,
                    default:''
                },
                option2:{
                    type:String,
                    default:''
                },
                option3:{
                    type:String,
                    default:''
                },
                option4:{
                    type:String,
                    default:''
                },
                status:{
                    type:String,
                    default:'active'
                }
});
DataTable.configure({ verbose: true, debug : true });
mongoose.plugin(DataTable.init);
var Question = mongoose.model('Question', questionSchema);
var MyModel = module.exports = require('mongoose').model('Question');

