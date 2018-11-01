const mongoose = require('mongoose');
var jwt=require('jsonwebtoken');
var twilio = require('twilio');
var geolib = require('geolib');
var bcrypt = require('bcrypt');
var faker = require('faker');
var _ = require('lodash');
var requ = require('request');
var FCM = require('fcm-push');
var apn = require('apn');
var path = require('path');
global.fetch = require('node-fetch')
const AWS = require('aws-sdk');

var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
var fs = require('fs');
require('mongoose-query-random');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App', { useNewUrlParser: true });
var db=mongoose.connection;
process.env.SECRET_KEY="5b0ce1bcc8396e65fca49958";
var serverKey = 'AAAAlWBKNm8:APA91bFEzUVBoKey_aeogj0dKsqwmg7dcPUFS_wndS4NVd3GKpZbZCki6zSafm0kOmQlfG9jsaWIf87Y8ddjRm01XGM2nHlKwFsNZFwlORZ-eSQcjPBy3s1IoLsFjMdg7wtD8rw2PKkBAUf7bSwjJA68rHbtAUC-PQ';
var fcm = new FCM(serverKey);

AWS.config.update({
    accessKeyId: "AKIAJTBEMMMNELPRJZAA",
    secretAccessKey: "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"
  });

var userSchema=mongoose.Schema({
                name:{
                    type:String
                },
                gender:{
                    type:String,
                    default:''
                },
                dob:{
                    type:String,
                    default:''
                },
                age:{
                    type:String,
                    default:''
                },
                seeking:{
                    type:String,
                    default:''
                },
                mobile:{
                    type:String
                },
                latitude:{
                    type:String,
                    default:'00.000000'
                },
                 longitude:{
                    type:String,
                    default:'00.000000'
                },
                images:{
                    type:String
                },
                date: { 
                      type: String,
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
                delete:{
                    type:String,
                    default:0
                },
                country:{
                    type:String,
                    default:''
                },
                countrycode:{
                    type:String,
                    uppercase: true
                },
                index:{
                	type:Number
                }
});
var User=mongoose.model('User',userSchema);

var CounterSchema = mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);


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
var FcmDevice=mongoose.model('FcmDevice',FcmDeviceSchema);

var matchSchema=mongoose.Schema({
                user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                liked_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                status:{
                    type:String
                }, 
                date: { 
                    type:String,
                    default:'' 
                },
                user_ids:{
                    type:[String]
                },
                end:{
                    type:String,
                    default:0
                }

});
var Match=mongoose.model('Match',matchSchema);

var otpSchema=mongoose.Schema({
                otp:{
                    type:String,
                    required:true
                },
                mobile:{
                    type:String,
                    required:true
                }
});
var Pin=mongoose.model('Pin',otpSchema);

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
var Setting=mongoose.model('Setting',settingSchema);

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
    }

});

var Admin  = mongoose.model('Admin', adminSchema);

// User Schema
var questionSchema=mongoose.Schema({
                question:{
                    type:String
                },
                category:{
                    type:String
                },
                type:{
                    type:String
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

var Question = mongoose.model('Question', questionSchema);

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

var MatchQuestion = mongoose.model('MatchQuestion', matchquestionSchema);

var answerSchema=mongoose.Schema({
                answer:{
                    type:String
                },
                user_id:{
                    type:String
                },
                question_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'MatchQuestion' },
                // answers:[{user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, answer: String}]
});

var Answer = mongoose.model('Answer', answerSchema);

var reportSchema=mongoose.Schema({
                user_id:{
                    type:String
                },
                report_user_id:{
                    type:String
                },
                type:{
                    type:String
                },
                status:{
                    type:String,
                    default:'open'
                },
                date:{
                    type:String
                }
});

var Report = mongoose.model('Report', reportSchema);

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

var MobileShare = mongoose.model('MobileShare', mobileshareSchema);

var cmsSchema = mongoose.Schema({
    type: {
        type: String
    },
    content: {
        type: String
    },
    date: { 
        type:String
    }

});

var Cms = mongoose.model('Cms', cmsSchema);

var dislikeSchema=mongoose.Schema({
                user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                dislike_user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }

});
var Dislike=mongoose.model('Dislike',dislikeSchema);

exports.admin = function(request, response){
  
    bcrypt.hash(request.body.password, 10, function(err, hash){
        if(err) throw err;
        var data={
            username: request.body.username,
            password: hash
        }
        Admin.create(data,function(creq,cres) {
           var result={
                status:1,
                message:'Admin Created Successfully'
            }
           return response.send(result); 
       })
    });

}

exports.dummyusers = function(request, response){
  
        var name = faker.name.findName(); // Rowan Nikolaus
        var gender='Male';
        var seeking='Friendship';
        var status='active';
        var dob='';
        var mobile=faker.phone.phoneNumber();
        var latitude=faker.address.latitude();
        var longitude=faker.address.longitude();
        var data={
            name:name,
            gender:gender,
            seeking:seeking,
            status:status,
            dob:dob,
            mobile:mobile,
            latitude:latitude,
            longitude:longitude,
            images:''
        }
        User.create(data,function(creq,cres) {
           var result={
                status:1,
                data:cres,
                message:'User Created Successfully'
            }
           return response.send(result); 
       })
}

exports.otp = function(request, response){
    var otp;
    var mobile = request.body.mobile;
    if (!mobile) {
        var result={
            status:0,
            message:'Please Enter Your Mobile Number'
        }
        return response.json(result);
    }
    if (mobile=='+919780329759') {
       otp = '000000';
    }else{
       otp = Math.floor(Math.random() * 90000) + 100000;
    }
    var data={
         otp:otp,
         mobile:mobile
    }
    var accountSid = 'AC1a39f67221aa9de28b356fc8e6416a52';
    var authToken = 'cba81159ff32f65b6129b8e38f14b014';
    var client = new twilio(accountSid, authToken);

    Pin.findOne({mobile:mobile},function(req,res) {
        if (res) {
            Pin.update({mobile:mobile},data,function(ureq,ures) {
                console.log(ures);
            })
            var exist=1;
        }else{
            Pin.create(data,function(creq,cres) {
                console.log(cres);
            })
            var exist=0;
        }
        User.findOne({mobile:mobile},function(usreq,usres) {
            if (usres) {
               var blocked=usres.status;
               if (usres.status=='deactive') {
                   otp='';
               }else{
                    client.messages.create({
                        body: 'Here is your verification code from SOPHY : ' + otp,
                        to: mobile,
                        from: '+15097923615 '
                    })
                    .then((message) => console.log(message.sid));
                }
            }else{
                    client.messages.create({
                        body: 'Here is your verification code from SOPHY : ' + otp,
                        to: mobile,
                        from: '+15097923615 '
                    })
                    .then((message) => console.log(message.sid));
               var blocked='new';
            }

            var result={
                        status:1,
                        otp:otp,
                        exist:exist,
                        blocked:blocked,
                        message:'Otp Send Successfully'
                    }
            return response.json(result);
        })    
    })  

}

exports.otpverify = function(request, response){
    var otp = request.body.otp;
    var code = request.body.code;
    var mobile = request.body.mobile;
    var country = request.body.country;
    if (!otp) {
        var result={
            status:0,
            message:'Otp is Required'
        }
        return response.send(result);
    }
    if (!code) {
        var result={
            status:0,
            message:'Code is Required'
        }
        return response.send(result);
    }
    if (!mobile) {
    var result={
            status:0,
            message:'Mobile Number is Required'
        }
        return response.send(result);
    }
    if (!country) {
    var result={
            status:0,
            message:'Country code is Required'
        }
        return response.send(result);
    }
    Pin.findOne({mobile:mobile,otp:otp},function(req,res) {
        var countryname;
        //https://restcountries.eu/rest/v2/callingcode/
		requ(' https://restcountries.eu/rest/v2/alpha?codes='+country, function (error, respo, body) {
		  console.log('error:', error); 
		  console.log('statusCode:', respo && respo.statusCode);
		   if (body) {
			  console.log('body:', JSON.parse(body)); 
			  var bo=JSON.parse(body)
			  console.log('countryname is here:',bo[0]['name'] ); 
			  countryname=bo[0]['name'];
			}else{
				countryname=country;
			}
	        if (res) {
	            console.log('1');
	            var data={
	                mobile:mobile,
	                country:countryname,
	                name:'',
	                dob:'',
	                gender:'',
	                seeking:'',
	                latitude:'',
	                longitude:'',
	                images:'',
	                date:'',
                    countrycode:country
	            }
	            User.findOne({mobile:mobile},function(ureq,ures) {
	                if (ures) {
                        User.update({_id:ures._id},{delete:0},function(dreq,dres) {
                        var token=jwt.sign({id:ures._id},process.env.SECRET_KEY,{
                                expiresIn:'365d'
                            });
                            var result={
                                status:1,
                                data:ures,
                                token:token,
                                message:'Otp Verification Successfull'
                            }
                            return response.send(result);   
                        })
	                }else{
	                	counter.findByIdAndUpdate({_id: 'userId'}, {$inc: { seq: 1} }, function(error, counter)   {
	                		console.log("counter is here  " + counter.seq)
	                		var datanew={
				                mobile:mobile,
				                country:countryname,
				                name:'',
				                dob:'',
				                gender:'',
				                seeking:'',
				                latitude:'',
				                longitude:'',
				                images:'',
				                date:'',
			                    countrycode:country,
			                    index:counter.seq
				            }
                            User.create(datanew,function(creq,cres) {
		                    	if (cres) {
		                    		Setting.create({user_id:cres._id},function(sreq,sres) {
		                    			var token=jwt.sign({id:cres._id},process.env.SECRET_KEY,{
				                            expiresIn:'365d'
				                        });
				                        var result={
				                            status:1,
				                            data:cres,
				                            token:token,
				                            message:'Otp Verification Successfull'
				                        }
				                        return response.send(result);
		                    		})
		                    	}
		                    })
                        });
	                } 
	            })

	        }else{
	                var result={
	                    status:0,
	                    message:'Otp Verification Failed'
	                }
	                return response.send(result);
	        }
		});
        
    })  

}

exports.signup = function(request, response){
    var _id = request.body._id;
    var name = request.body.name;
    var dob = request.body.dob;
    var age = request.body.age;
    var gender = request.body.gender;
    var seeking = request.body.seeking;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    if (!_id || !name || !dob || !gender || !seeking) {
        var result={
            status:0,
            message:'Please Fill All Details'
        }
        return response.json(result);
    }
    if (!latitude) {
    	latitude='00.000000';
    }
    if (!longitude) {
    	longitude='00.000000';
    }
        var d = new Date(),month = '' + (d.getMonth() + 1),day = '' + d.getDate(),year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        var date=[day,month,year].join('-');
    var data={
        name:name,
        dob:dob,
        gender:gender,
        seeking:seeking,
        latitude:latitude,
        longitude:longitude,
        images:'',
        date:date,
        age:age,
        profile:''
    }
    User.update({_id:_id},data,function(req,res) {
        console.log(res);
        if (res) {
            if (request.body.device_token) {
                    var devicedata={
                    device_type:request.body.device_type,
                    device_id:request.body.device_id,
                    device_token:request.body.device_token,
                    user_id:_id
                }
                FcmDevice.create(devicedata,function(dreq,dres) {
                    var token=jwt.sign({id:_id},process.env.SECRET_KEY,{
                        expiresIn:'365d'
                    });
                    var result={
                        status:1,
                        data:token,
                        message:'Registeration Successfull'
                    }
                    return response.json(result);
                })
            }else{
                    var token=jwt.sign({id:_id},process.env.SECRET_KEY,{
                        expiresIn:'365d'
                    });
                    var result={
                        status:1,
                        data:token,
                        message:'Registeration Successfull'
                    }
                    return response.json(result);
            }
        }else{
                var result={
                    status:0,
                    message:'Registeration Failed'
                }
                return response.json(result);
        }
    })  

}

exports.pushnotification = function(request, response){
    var user_id = request.body.user_id;
    var device_type = request.body.device_type;
    var device_token = request.body.device_token;
    var device_id = request.body.device_id;
    if (!user_id || !device_type || !device_token || !device_id) {
        var result={
            status:0,
            message:'Please Send All Fields'
        }
        return response.json(result);
    }
        var devicedata={
            device_type:request.body.device_type,
            device_id:request.body.device_id,
            device_token:request.body.device_token,
            user_id:request.body.user_id   
        }
    FcmDevice.findOne({device_id:device_id,user_id:user_id},function(req,res) {
        console.log(res);
        if (res) {
            FcmDevice.update({device_id:device_id,user_id:user_id},devicedata,function(dreq,dres) {
                var result={
                    status:1,
                    message:'Record Updated Successfully'
                }
                return response.json(result);
            })
        }else{
            FcmDevice.create(devicedata,function(dreq,dres) {
                 var result={
                    status:1,
                    data:dres,
                    message:'Record Created Successfully'
                }
                return response.json(result);
            })      
        }
    })  
}

exports.uploadimages = function(request, response){
  console.log(request.files);
    var imagename = []
    if (request.files['images']) {

        for (var i = 0; i < request.files['images'].length; i++) {
            var img_name=request.files['images'][i].filename;
            console.log('wizard  = ' + request.files['images'][i].filename)
            imagename.push(request.files['images'][i].filename)
            var s3 = new AWS.S3();
            var params = {
                Bucket: 'sophyapp-media',
                Body : fs.createReadStream(request.files['images'][i].path),
                Key :  request.files['images'][i].filename
            };
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                    _.pull(imagename, img_name);
                }
                if (data) {
                    
                    console.log("Uploaded in:", data.Location);
                }
            }); 
        }
    }
    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    if (!_id) {
        var result={
            status:0,
            message:'ID is Required'
        }
        return response.json(result);
    }
    var data={
        images:JSON.stringify(imagename),
        profile:'complete'
    }

    User.update({_id:_id},data,function(req,res) {
        console.log(res);
        if (res) {
                var result={
                    status:1,
                    message:'Images Uploaded Successfully'
                }
        }else{
                var result={
                    status:0,
                    message:'Upload Failed'
                }
        }

        return response.json(result);
    })  
}

exports.me = function(request,response){
    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
        var userId = decoded.id;
        User.findOne({_id: userId},function(req,res){
            
            return response.send(res);
        });
    }else{
         return response.send('unauthorized');
    }

}

exports.nearbyusers = function (request, response) {
	var token = request.body.token || request.headers['token'];
	if (token) {
		var authorization = token,
			decoded;
		try {
			decoded = jwt.verify(authorization, process.env.SECRET_KEY);
		} catch (e) {
			return response.send('unauthorized');
		}
	}
	var _id = decoded.id;
	console.log(_id);
	if (!_id) {
		var result = {
			status: 0,
			message: 'ID is Required'
		}
		return response.json(result);
	}
	if (!request.body.latitude || !request.body.longitude) {
		var result = {
			status: 0,
			message: 'LatLong is Required'
		}
		return response.json(result);
	}
	var userseeking=[];
	var userdistance;
    User.update({_id:_id},{latitude:request.body.latitude,longitude:request.body.longitude},function(lreq,lres) {
       Setting.findOne({user_id:_id},function(sreq,sres) {
           if (sres) {
                if (sres.seeking=='Both') {
                   userseeking.push('Male');
                   userseeking.push('Female');
                }else if(sres.seeking=='Women'){
                   userseeking.push('Female');
                }else{
                    userseeking.push('Male');
                }
                if (sres.distance==804672) {
                   userdistance=804672;
                }else{
                  userdistance=sres.distance;
                }
            }else{
                 userseeking.push('Male');
                 userseeking.push('Female');
                 userdistance=804672;
            }
            Match.find({user_id:_id}, function (mreq, mres) {
                var like_ids = [];
                if (mres) {
                    // mres.forEach(function (mval, mind, marr) {
                    //  like_ids.push(mval.liked_user_id);
                    // })
                    for (let mval of mres) {
                          like_ids.push(mval.liked_user_id);
                    }
                }
                if (!like_ids.length) {
                    like_ids.push(_id);
                }
                Match.find({liked_user_id:_id,status:1},function(dreq,dres) {
                    if (dres) {
                        for (let dval of dres) {
                           like_ids.push(dval.user_id);
                        }
                    }
                    User.find({$and: [{ $or: [{_id: {$nin: like_ids}}] },{ $or: [{gender: {$in: userseeking}}] },{ $or: [{profile:'complete'}] },{ $or: [{delete:0}] },{ $or: [{status:'active'}] }]}, function (req, res) {
                        var users = []
                        if (res) {
                           res.forEach(function (val, ind, arr) {
                            var data = {
                                latitude: val.latitude,
                                longitude: val.longitude
                            }
                            if (data.latitude != 0) {
                                var check = geolib.isPointInCircle({
                                        latitude: request.body.latitude,
                                        longitude: request.body.longitude
                                    },
                                    data,
                                    userdistance
                                );
                            }
                            if (check) {
                                users.push(val._id)
                            }

                        })
                        }
                        if (users.length) {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i] == _id) {
                                    console.log('check  =' + users[i])
                                    users.splice(i, 1);
                                }
                            }
                            console.log(users);
                            var final = []
                            User.find({_id: users,profile:'complete',delete:0,status:'active'}, function (nreq, nres) {
                                nres.forEach(function (value, index) {
                                    console.log("value is " + value + ' ' + "index is" + index);
                                    var obj = value.toObject({
                                        getters: true
                                    });
                                    var dist = geolib.getDistanceSimple({
                                        latitude: value.latitude,
                                        longitude: value.longitude
                                    }, {
                                        latitude: request.body.latitude,
                                        longitude: request.body.longitude
                                    });
                                    var obj2 = {
                                        distance: dist,
                                        miles:geolib.convertUnit('mi', dist, 2) // -> 14,21
                                    };
                                    _.merge(obj, obj2);
                                    final.push(obj);
                                });
                                final.sort(function(a, b){
                                    var keyA = a.distance,
                                        keyB = b.distance;  
                                    // Compare the 2 dates
                                    if(keyA < keyB) return -1;
                                    if(keyA > keyB) return 1;
                                    return 0;
                                });
                                User.findOne({_id:_id},function(usreq,usres) {
                                    if (usres) {
                                         var blocked=usres.status;
                                    }else{
                                        var blocked='active';
                                    }
                                    var result = {
                                        status: 1,
                                        data: final,
                                        blocked:blocked,
                                        message: "Near By User Found"
                                    }
                                    return response.send(result);
                                })
                            })
                        } else {

                            var result = {
                                status: 0,
                                message: "No one is near you!!"
                            }
                            return response.send(result);
                        }
                    })  
                })
            })
        })
    })
}

exports.like = function(request, response){
    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    console.log(_id);
    if (!_id) {
        var result = {
            status: 0,
            message: 'ID is Required'
        }
        return response.json(result);
    }
    var liked_user_id=request.body.liked_user_id
    if (!liked_user_id) {
        var result = {
            status: 0,
            message: 'liked_user_id is Required'
        }
        return response.json(result);
    }
    var type=request.body.type;
    if (!type) {
        var result = {
            status: 0,
            message: 'Type is Required'
        }
        return response.json(result);
    }
    if (type=='like') {
        // {$and: [{ $or: [{liked_user_id:_id}] },{ $or: [{status: 0}] }]}
        Match.findOne({$and: [ { liked_user_id: _id }, { user_id: liked_user_id }, { status: 0 } ]},function(req,res){
            if (res) {
            var d = new Date(),month = '' + (d.getMonth() + 1),day = '' + d.getDate(),year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            var date=[day,month,year].join('-');
                Match.update({_id:res._id},{status:1,date:date},function(ureq,ures) {
                   if (ures) {
                      Question.find({category: 'basic',status:'active'}).lean().random(8, true, function(err, basic) {
                            Question.find({category: 'deep',status:'active'}).lean().random(21, true, function(err, deep) {
                                Match.findOne({_id:res._id}).populate('liked_user_id').populate('user_id').exec(function(err, userdata){
                                    var merge = _.concat(basic,deep);
                                    var finalquestion=[];
                                    merge.forEach(function (mval, mind, marr) {
                                        var match_id=ures._id;
                                        var question=mval.question;
                                        var type    =mval.type;
                                        var option1 =mval.option1;
                                        var option2 =mval.option2;
                                        var option3 =mval.option3;
                                        var option4 =mval.option4;
                                        var qa={
                                                match_id:res._id,
                                                question:mval.question,
                                                type    :mval.type,
                                                option1 :mval.option1,
                                                option2 :mval.option2,
                                                option3 :mval.option3,
                                                option4 :mval.option4
                                            }
                                            finalquestion.push(qa);
                                    });
                                    if (finalquestion.length) {
                                        MatchQuestion.insertMany(finalquestion,function(ireq,ires) {
                                            if (ires) {
                                            	MobileShare.find({match_id:res._id},function(mreq,mres) {
                                                    FcmDevice.findOne({user_id:liked_user_id},function(dres,dres) {
                                                        if (dres) {
                                                        var message = {
                                                                to: dres.device_token,
                                                                collapse_key: 'your_collapse_key', 
                                                                data: {
                                                                    priority:"high",
                                                                    show_in_foreground: true
                                                                },
                                                                notification: {
                                                                    title: 'Sophy App',
                                                                    body: "Hey "+userdata.user_id.name+", you've got matched with "+userdata.liked_user_id.name+". Start Q&A now!"

                                                                }
                                                            };
                                                            fcm.send(message, function(err, respo){
                                                                if (err) {
                                                                    console.log("Something has gone wrong!");
                                                                } else {
                                                                    console.log("Successfully sent with response: ", respo);
                                                                
                                                                }
                                                                    var result={
                                                                       status:1,
                                                                       data:userdata,
                                                                       question:merge,
                                                                       mobileshare:mres,
                                                                       length:merge.length,
                                                                       message:"match Successfully"
                                                                    }
                                                                return response.json(result);
                                                            });   
                                                        }else{
                                                                var result={
                                                                   status:1,
                                                                   data:userdata,
                                                                   question:merge,
                                                                   mobileshare:mres,
                                                                   length:merge.length,
                                                                   message:"match Successfully"
                                                                }
                                                            return response.json(result);
                                                        }    
                                                    })   	 
                                            	})
                                            }else{

                                            }
                                        })
                                    }
                                });    
                            });    
                        })
                   }
                })
            }else{
                Match.findOne({$and: [ { user_id: _id }, { liked_user_id: liked_user_id } ]},function(freq,fres) {
                  if (fres) {
                            var result={
                               status:0,
                               message:"You Already Liked"
                           }
                          return response.json(result);
                  }else{
                        
                        var data={
                           user_id:_id,
                           liked_user_id:liked_user_id,
                           status:0
                        }
                        Match.create(data,function(creq,cres) {
                        if (cres) {
                            Match.findOne({_id:cres._id}).populate('liked_user_id').populate('user_id').exec(function(err, userdata){
                                	var result={
    		                           status:1,
    		                           data:userdata,
    		                           message:"liked Successfully"
    	                            }
    	                            return response.json(result); 
                            });
                         
                        }
                        else{
                            
                            var result={
                               status:0,
                               message:"liked Failed"
                          }
                          return response.json(result);
                         } 
                       })
                   }
                })
            }
        })
    }else{
        Dislike.create({user_id:_id,dislike_user_id:liked_user_id},function(dreq,dres) {
           if (dres) {
                var result={
                           status:1,
                           data:dres,
                           message:"dislike Successfully"
                        }
                return response.json(result); 
            }
        })
    }
    
}

exports.userdetails = function(request, response){
    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var user_id = decoded.id;
    var _id = request.body._id;
   
    if (!_id ) {
        var result={
            status:0,
            message:'Id is required'
        }
        return response.json(result);
    }
    User.findOne({_id:_id},function(req,res) {
        User.findOne({_id:user_id},function(ureq,ures) {
        var obj;
    	if (res) {
	            obj = res.toObject({getters: true});
	            var dist = geolib.getDistanceSimple({
		            latitude: res.latitude,
		            longitude: res.longitude
		        }, {
		            latitude: ures.latitude,
		            longitude: ures.longitude
		        });
		        var obj2 = {
		            distance: dist
		        };
		        _.merge(obj, obj2);
		        console.log(res);
		        var result={
                    status:1,
                    data:obj,
                    blocked:res.status,
                    message:'Success'
                }
    	}
        else{
                var result={
                    status:0,
                    message:'Failed'
                }
        }

        return response.json(result);
        })
    }) 
}    

exports.settings = function(request, response){
    var distance = request.body.distance;
    var seeking = request.body.seeking;   
    if (_.includes(seeking,'Women')) {
        seeking='Women';
    }else if(_.includes(seeking,'Men')){
        seeking='Men';
    }else{
        seeking='Both';
    } 
    var data={
    	distance:distance,
    	seeking:seeking
    }
    
    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    Setting.findOne({user_id:_id},function(req,res) {
        console.log(res);
        if (res) {
        	Setting.update({_id:res._id},data,function(ureq,ures) {
                 var result={
                    status:1,
                    data:ures,
                    message:'Settings Updated Successfully'
                } 
                return response.json(result);          
        	})
   
        }else{
        	Setting.create(data,function(creq,cres) {
                 var result={
                    status:1,
                    data:cres,
                    message:'Settings Created Successfully'
                }  
                return response.json(result);         
        	})
        }
    }) 
} 

exports.report = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    var type = request.body.type;
    var report_user_id = request.body.report_user_id;
    var d = new Date(),month = '' + (d.getMonth() + 1),day = '' + d.getDate(),year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        var date=[day,month,year].join('-');
    var data={
    	user_id:_id,
    	report_user_id:report_user_id,
    	type:type,
        date:date
    }
    Report.create(data,function(req,res) {
        console.log(res);
        var result={
                    status:1,
                    data:res,
                    message:'Report Submitted Successfully'
                }  
        return response.json(result);
    }) 
} 

exports.deleteaccount = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    User.update({_id:_id},{delete:1},function(req,res) {
        console.log(res);
        var result={
                    status:1,
                    data:res,
                    message:'Account Deleted Successfully'
                }  
        return response.json(result);
    }) 
} 

exports.editprofile = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    var dob = request.body.dob;
    var gender = request.body.gender;
    var seeking = request.body.seeking;
    var one=[];
    var newimages=[];
    User.findOne({_id:_id},function(req,res) {
        var two=[];
        console.log(res);
        if (res.images) {
            two = JSON.parse(res.images);	
        }
        if (request.body.imagesname) {
			var one = request.body.imagesname
			one = one.split(",")
			console.log('two.length is ' + two.length + "  and one.length is " + one.length + "  one is =" + one + "  two =" + two);
			update();
		}
		function update() {
			 if (request.body.imagesname) {
				function arr_diff(a1, a2) {
					    var a = [],
						diff = [];
					for (var i = 0; i < a1.length; i++) {
						a[a1[i]] = true;
					}
					for (var i = 0; i < a2.length; i++) {
						if (a[a2[i]]) {
							delete a[a2[i]];
						} else {
							a[a2[i]] = true;
						}
					}
					for (var k in a) {
						diff.push(k);
					}
					return diff;
				}
				var del = arr_diff(two, one)
				console.log("del = " + del)
				for (var i = 0; i < del.length; i++) {
					var filePath = __dirname + '/images' + '/' + del[i]
					two.pop(del[i])
					try {
                            var s3 = new AWS.S3();
                            var params = {
                              Bucket: 'sophyapp-media', 
                              Delete: { 
                                Objects: [ 
                                  {
                                    Key: del[i] 
                                  }
                                ],
                              },
                            };

                            s3.deleteObjects(params, function(err, data) {
                              if (err) console.log(err, err.stack); 
                              else     console.log(data);  
                            });
                            fs.unlinkSync(filePath);
					} catch (e) {

					}
				}
				console.log("two = " + two)
			}
		}
        if (request.files) {
            if (request.files['images']) {
                console.log("ins image" + request.files['images'])
                for (var i = 0; i < request.files['images'].length; i++) {
                    var img_name=request.files['images'][i].filename;
                    console.log('wizard  = ' + request.files['images'][i].filename + '   names here   ' + request.body.imagesname )
                    var s3 = new AWS.S3();
                    var params = {
                        Bucket: 'sophyapp-media',
                        Body : fs.createReadStream(request.files['images'][i].path),
                        Key :  request.files['images'][i].filename
                    };
                    newimages.push(request.files['images'][i].filename);
                    s3.upload(params, function (err, data) {
                        if (err) {
                            console.log("Error", err);
                            _.pull(newimages, img_name);
                        }
                        if (data) {
                            
                            console.log("Uploaded in:", data.Location);
                        }
                    }); 
                }
            }
        }
        if(one){
          for (let img of one) {
             newimages.push(img);
            }
        }
		var data={
	    	dob:dob,
	    	gender:gender,
	    	seeking:seeking,
	    	images:JSON.stringify(newimages)
	    }
        if (res) {
          User.update({_id:_id},data,function(ureq,ures) {
          	User.findOne({_id:_id},function(freq,fres) {
          	   var result={
	                    status:1,
	                    data:fres,
	                    message:'Profile Updated Successfully'
	                }  
	            return response.json(result);	 
          	})   
          })
        }else{
	            var result={
	                    status:0,
	                    message:'Profile Updated Failed'
	                }  
	        return response.json(result);   
        }
    }) 
}

exports.match = async (request, response) => {

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
   
   var userdata= await Match.find({$and: [{ $or: [{ user_id:_id },{ liked_user_id:_id }] },{ $or: [{ status:1 }] }],user_ids: { $ne: _id }}).populate('user_id').populate('liked_user_id');
   // Match.find({$and: [ { user_id:_id }, { status: 1 } ]}) .populate('liked_user_id').exec(function(err, userdata){

    var final=[];
    for (let file of userdata) {
       const contents = await MatchQuestion.find({match_id:file._id});
       var obj=file.toObject({getters:true});
       var obj2={matchquestions:contents};
       _.merge(obj, obj2);
       final.push(obj);
    }
    User.findOne({_id:_id},function(usreq,usres) {
        if (usres) {
                 var blocked=usres.status;
            }else{
                var blocked='active';
            }
        if (userdata) {
            var result={
                        status:1,
                        data:final,
                        blocked:blocked,
                        message:'success'
                    }  
                return response.json(result);
        }else{
            var result={
                        status:0,
                        blocked:blocked,
                        message:'No Match Found'
                    }  
                return response.json(result);
        }
    })
}  

exports.matchquestions = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   if (!request.body.match_id) {
        var result={
            status:0,
            message:'Match Id is Required'
        }
        return response.send(result);
   }
   MatchQuestion.find({ match_id:request.body.match_id }).populate({path: 'answers.user_id',model: 'User'}).exec(function(err, question){
     if (question) {
     	MobileShare.find({match_id:request.body.match_id},function(mreq,mres) {
            var result={
                        status:1,
                        data:question,
                        mobileshare:mres,
                        message:'success'
                    }  
                return response.json(result);
        });        
     }else{
            var result={
                        status:0,
                        message:'No Question Found'
                    }  
                return response.json(result);
     }

   })

}

exports.swipe = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   if (!request.body.imagesorder) {
        var result={
            status:0,
            message:'Images Order is Required'
        }
        return response.send(result);
   }
   // var data={
   //      images:JSON.stringify(request.body.imagesorder),
   //  }
   // var _id = decoded.id;
   // User.update({_id:_id },data,function(err, userdata){
   //  if (userdata) {
            var result={
                        status:1,
                        message:'success'
                    }  
            return response.json(result);
    // }else{
    //         var result={
    //                     status:0,
    //                     message:'failed'
    //                 }  
    //         return response.json(result);
    // }

   //})

}

exports.answer = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   if (!request.body.question_id) {
        var result={
            status:0,
            message:'Question Id is Required'
        }
        return response.send(result);
   }
   var user_ids=request.body.user_ids;
   var answers={
   	   user_id:request.body.user_id,
   	   answer:request.body.answer,
   }
    MatchQuestion.findOne({$and: [ { _id:request.body.question_id }, { user_ids: {$in: request.body.user_id} }]}).exec(function(err, checkdata){
      if (!checkdata) {
            MatchQuestion.findByIdAndUpdate(request.body.question_id ,{$push: {answers: answers,user_ids:request.body.user_id}}, {upsert:true}).exec(function(err, userdata){
                if (userdata) { 
                    var time; var both;
                    if (userdata.time) {
                        time=userdata.time
                    }else{
                        time=new Date()
                    }
                    if (userdata.both=='nobody') {
                        both='single'
                    }else if(userdata.both=='single'){
                        both='both'
                    }
                    MatchQuestion.update({_id:request.body.question_id},{time:time,both:both}).exec(function(err, timedone){
                        MatchQuestion.find({_id:request.body.question_id}).populate({path: 'answers.user_id',model: 'User'}).exec(function(err, questiondata){
                        //MatchQuestion.aggregate([{
                                    //              $lookup: {
                                    //                  from: "answers", // collection name in db
                                    //                  localField: "_id",
                                    //                  foreignField: "question_id",
                                    //                  as: "answers"
                                    //              }
                                    //          },
            
                                 // ]).exec(function(err, questiondata){
                            var result={
                                        status:1,
                                        data:questiondata,
                                        message:'Answer Submitted Successfully'
                                    }  
                             return response.json(result);
                        });  
                    });
                 
                }else{
                    var result={
                                status:0,
                                data:err,
                                message:'failed'
                            }  
                    return response.json(result);
                }
            })     
        }else{
                var result={
                                status:1,
                                data:checkdata,
                                message:'Answer Submitted Successfully'
                            }  
                     return response.json(result);
        }
    })      
}   

exports.usersettings = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   var _id = decoded.id;
   Setting.findOne({user_id:_id },function(err, userdata){
        User.findOne({_id:_id},function(usreq,usres) {
            if (usres) {
                 var blocked=usres.status;
            }else{
                var blocked='active';
            }
            if (userdata) {
            var result={
                        status:1,
                        data:userdata,
                        blocked:blocked,
                        message:'success'
                    }  
                    return response.json(result);
            }else{
                    var result={
                                status:0,
                                blocked:blocked,
                                message:'failed'
                            }  
                    return response.json(result);
            }
        })
   })

}

exports.mobileshare = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   var _id = decoded.id;
   console.log('id is here '+ _id);
   var match_id = request.body.match_id;
   var answer = request.body.answer;
   MobileShare.findOne({$and: [ { user_id: _id }, { match_id: match_id }]},function(freq,fres) {
      if (fres) {
          MobileShare.update({_id:fres._id},{status:answer},function(err, userdata){
                if (userdata) {
			            var result={
			                        status:1,
			                        data:userdata,
			                        message:'mobile number shared Successfully'
			                    }  
			            return response.json(result);
			    }else{
			            var result={
			                        status:0,
			                        message:'failed'
			                    }  
			            return response.json(result);
			    }
          });	
      }else{
           MobileShare.create({user_id:_id,status:answer,match_id:match_id},function(err, userdata){
           	    if (userdata) {
			            var result={
			                        status:1,
			                        data:userdata,
			                        message:'mobile number shared Successfully'
			                    }  
			            return response.json(result);
			    }else{
			            var result={
			                        status:0,
			                        message:'failed'
			                    }  
			            return response.json(result);
			    }
          }); 	
      }                 	 
   })

}

exports.logout = function(request, response){

    var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
   var _id = decoded.id;
   console.log('id is here '+ _id);
   var device_id = request.body.device_id;
   FcmDevice.findOne({$and: [ { user_id: _id }, { device_id: device_id }]}).remove(function(freq,fres) {
        if (fres) {
                var result={
                    status:1,
                    message:'Logout Successfully'
                }  
            return response.json(result);
        }else{
                var result={
                    status:0,
                    message:'Logout Failed'
                }  
            return response.json(result);
        }               
   })
}

exports.notification = function(request, response){
    var message = {
        to: 'e0ec5pkpAsg:APA91bHEMiIhsesQHXyeTWghq2D2hvTDyPGeyd1127f626QH61ZzTw5nGjncc7NjO_UbBIb0j-YuPxudxhTCkH95twc4w2N4vG1pqU1Tmv1arD54yHA_Fz_VQGl1ak0OFicd-H3h2ETDjRFRRa-GRkwwiedA2aSleQ',
        collapse_key: 'your_collapse_key', 
        data: {
            title: 'data push notification',
            body: 'data push notification',
            priority: "high",
            show_in_foreground: true,

        },
        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification'
        }
    };
    fcm.send(message, function(err, respo){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", respo);
            response.send('Successfully sent with response');
        }
    });
    // let tokens = ['dmouc0R8Ra0:APA91bHkkgDWRLjU437rvICh1zpM8xOxAAzXr-CXLD-KSrUai3JtIJWH06sturMJm2ZIm4AzKq-Fm3IQOnhJoA0UwzwYEoHtCAeZSM6t7evmK1Myhz0cKdlsl8Mo8-c-_HBF5mr1Buu0oB8w6rY87guTEZrue8JdOQ'];
    //     let service = new apn.Provider({
    //         "cert": path.join(__dirname, "/certificates/cert.pem"),
    //         "key": path.join(__dirname, "/certificates/key.pem"),
    //          "production": false
    //     });
    //     let note = new apn.Notification({
    //         alert:  ' started following you'
    //     });
    //     note.payload = {
    //         title: 'data push notification'
    //     }
    //     note.topic = "org.reactjs.native.example.sophy"; //bunder id
    //     console.log('Sending: note.compile() to tokens');
    //     service.send(note, tokens).then(result => {
    //         console.log("IN IOS SEND NOTIFICATION")
    //         console.log("sent:", result.sent.length);
    //         console.log("failed:", result.failed.length);
    //         console.log(result.sent);
    //         console.log(result.failed);
    //     });
    // service.shutdown(); 

}

exports.cms = function(request, response){

   Cms.findOne({type:request.body.type},function(freq,fres) {
        if (fres) {
                var result={
                    status:1,
                    data:fres,
                    message:'Success'
                }  
            return response.json(result);
        }else{
                var result={
                    status:0,
                    message:'Failed'
                }  
            return response.json(result);
        }               
   })
}

exports.refresh = function(request, response){
	var token=request.body.token || request.headers['token'];
    if (token) {
        var authorization = token,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.SECRET_KEY);
        }catch (e) {
            return response.send('unauthorized');
        }
    }
    var _id = decoded.id;
    console.log('id is here '+ _id);
    var match_id = request.body.match_id;
    var end_type = request.body.end_type;
    if (end_type=='reload') {
	    	MatchQuestion.find({match_id:match_id}).remove(function(mqreq,mqres) {
	        Question.find({category: 'basic'}).lean().random(8, true, function(err, basic) {
	            Question.find({category: 'deep'}).lean().random(21, true, function(err, deep) {
	                Match.findOne({_id:match_id}).populate('liked_user_id').populate('user_id').exec(function(err, userdata){
	                	    var noti_id;
	                	    var noti_name;
	                            	if (userdata.user_id._id==_id) {
	                            		noti_id=userdata.liked_user_id._id;
	                            		noti_name=userdata.liked_user_id.name;
	                            	}else{
	                            		noti_id=userdata.user_id._id;
	                            		noti_name=userdata.user_id.name;
	                            	}
	                        var merge = _.concat(basic,deep);
	                        var finalquestion=[];
	                        merge.forEach(function (mval, mind, marr) {
	                            var question=mval.question;
	                            var type    =mval.type;
	                            var option1 =mval.option1;
	                            var option2 =mval.option2;
	                            var option3 =mval.option3;
	                            var option4 =mval.option4;
	                            var qa={
	                                    match_id:match_id,
	                                    question:mval.question,
	                                    type    :mval.type,
	                                    option1 :mval.option1,
	                                    option2 :mval.option2,
	                                    option3 :mval.option3,
	                                    option4 :mval.option4
	                                }
	                                finalquestion.push(qa);
	                        });
	                    if (finalquestion.length) {
	                        MatchQuestion.insertMany(finalquestion,function(ireq,ires) {
	                            if (ires) {
	                            	MobileShare.find({match_id:match_id}).remove(function(mreq,mres) {
	                            	  FcmDevice.findOne({user_id:noti_id},function(dres,dres) {
	                                        if (dres) {
	                                        var message = {
	                                                to: dres.device_token,
	                                                collapse_key: 'your_collapse_key', 
	                                                data: {
	                                                    priority:"high",
	                                                    notif_type:2,
	                                                    show_in_foreground: true
	                                                },
	                                                notification: {
	                                                    title: 'Sophy App',
	                                                    body: noti_name+' has ended the Q&A'

	                                                }
	                                            };
	                                            fcm.send(message, function(err, respo){
	                                                if (err) {
	                                                    console.log("Something has gone wrong!");
	                                                } else {
	                                                    console.log("Successfully sent with response: ", respo);
	                                                
	                                                }
			                                        var result={
					                                               status:1,
					                                               data:userdata,
					                                               question:ires,
					                                               mobileshare:mres,
					                                               length:merge.length,
					                                               message:"match Successfully"
			                                                    }
			                                        return response.json(result);
	                                            });   
	                                        }else{
	                                             var result={
				                                               status:1,
				                                               data:userdata,
				                                               question:ires,
				                                               mobileshare:mres,
				                                               length:merge.length,
				                                               message:"match Successfully"
		                                                    }
		                                        return response.json(result);
	                                        }    
	                                    })
	                            	})
	                            }else{
	                                var result={
	                                               status:1,
	                                               message:"failed"
	                                            }
	                                return response.json(result);
	                            }
	                        })
	                    }
	                });    
	            });    
	        })
	    })
    }
    else{
       //MatchQuestion.find({match_id:match_id}).remove(function(mqreq,mqres) {
            //MobileShare.find({match_id:match_id}).remove(function(mreq,mres) {
                Match.findByIdAndUpdate(match_id ,{$push: {user_ids: _id},end:1}, {upsert:true}).exec(function(err, menddata){
                //Match.find({_id:match_id}).remove(function(err, userdata){
           	        var result={
	                       status:1,
	                       message:"End Successfully"
	                    }
		            return response.json(result);
                });
            //});	
        //});	
    }    
}

exports.uq = function(request, response){
              
    var poolData = {
        UserPoolId : 'us-east-1_6FZB6gaBY', // Your user pool id here
        ClientId : '26l35u8vmm0n1cp4mo6r3k1mqo' // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : 'akashmjp@gmail.com'
    };

    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : '+919761075358'
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
   var userData = {
        Username : '+919761075358',
        Pool : userPool
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    userPool.signUp('+919761075358', '123456@akash', attributeList, null, function(err, result){
        if (err) {
            console.log(err.message || JSON.stringify(err));
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        return response.send(result);
    });
     cognitoUser.resendConfirmationCode(function(err, result) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('call result: ' + result);
        return response.send(result);
    });
}
