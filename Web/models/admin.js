var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App',{ useMongoClient: true });
var Schema = mongoose.Schema;
var db = mongoose.connection;

// Admin Schema
var adminSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    phone: {
        type: String
    },
    profileimage: {
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date

});
var Admin = module.exports = mongoose.model('Admin', adminSchema);

module.exports.comparePassword = function(candidatePassowrd, hash, callback){
    bcrypt.compare(candidatePassowrd, hash, function(err, isMatch){
        if(err) return callback(err);
        callback(null, isMatch);
    });
}

module.exports.getUserById = function(id, callback){
    Admin.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    Admin.findOne(query, callback);
}

module.exports.createUser = function(newUser,callback){
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if(err) throw err;

        // Set Hashed password
        newUser.password = hash;

        // Create User
        newUser.save(callback);
    });
};
