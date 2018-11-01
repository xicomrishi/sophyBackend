var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var DataTable = require('mongoose-datatable');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

var FcmDeviceSchema=mongoose.Schema({
                user_id:{
                    type:String
                },
                device_type:{
                    type:String
                },
                device_token:{
                    type:String
                },
                device_id:{
                    type:String
                }
});
var FcmDevice = module.exports = mongoose.model('FcmDevice',FcmDeviceSchema);

