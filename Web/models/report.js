var mongoose = require('mongoose');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var reportSchema=mongoose.Schema({
                user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                report_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                type:{
                    type:String
                },
                status:{
                    type:String,
                    default:'open'
                },
                date: { 
                    type:String
                      // type: Date,
                      // default: Date.now 
                }
});

DataTable.configure({ verbose: true, debug : true });
mongoose.plugin(DataTable.init);
var Report = mongoose.model('Report', reportSchema);
var MyModel = module.exports = require('mongoose').model('Report');