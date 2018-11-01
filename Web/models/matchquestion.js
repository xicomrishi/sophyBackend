var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var matchquestionSchema=mongoose.Schema({
                question:{
                    type:String
                },
                match_id:{
                    type:String
                },
                type:{
                    type:String
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
                user_ids:{
                    type:[String]
                },
                answers:[{user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, answer: String}],
                time: {
                    type: String,
                    default: ''
                },
                both:{
                    type:String,
                    default:'nobody'
                },
                notification:{
                    type:String,
                    default:0
                }
});

var MatchQuestion = module.exports = mongoose.model('MatchQuestion', matchquestionSchema);

