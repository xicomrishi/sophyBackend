var mongoose = require('mongoose');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var matchSchema=mongoose.Schema({
                user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                liked_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                status:{
                    type:String
                }, 
                date: { 
                    type:String,
                    default:'' 
                }

});

DataTable.configure({ verbose: true, debug : true });
mongoose.plugin(DataTable.init);
var Match = mongoose.model('Match',matchSchema);
var MyModel = module.exports = require('mongoose').model('Match');