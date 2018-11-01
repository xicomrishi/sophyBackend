var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var dislikeSchema=mongoose.Schema({
                user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                dislike_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }

});
var Dislike = module.exports = mongoose.model('Dislike',dislikeSchema);

