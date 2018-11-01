var express = require('express');
var app = express();
var FCM = require('fcm-push');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27015/Sophy_App', { useNewUrlParser: true });
var db=mongoose.connection;
var serverKey = 'AAAAlWBKNm8:APA91bFEzUVBoKey_aeogj0dKsqwmg7dcPUFS_wndS4NVd3GKpZbZCki6zSafm0kOmQlfG9jsaWIf87Y8ddjRm01XGM2nHlKwFsNZFwlORZ-eSQcjPBy3s1IoLsFjMdg7wtD8rw2PKkBAUf7bSwjJA68rHbtAUC-PQ';
var fcm = new FCM(serverKey);

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


app.listen(3000, function () {
	console.log('server start');
});

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(async function() {

   console.log("I am doing my 1 minute check");
   var threeMinutesOld = new Date(); var notification_userid; var answered_username;
   threeMinutesOld.setMinutes(threeMinutesOld.getMinutes()-3)
   var matches=await Match.find({end:0}).populate('liked_user_id').populate('user_id').exec();
   var match_ids=[];
   if (matches) {
        for (let match of matches) {
            //match_ids.push(match._id);
            var matchquestion=await MatchQuestion.find({both:'single',match_id: match._id,notification:0,time: {$lt:threeMinutesOld}}).populate({path: 'answers.user_id',model: 'User'}).exec();
            console.log(matchquestion);
            for (let matchques of matchquestion) {
                if (matchques.user_ids.includes(match.user_id._id)) {
                    notification_userid=match.liked_user_id._id;
                    answered_username=match.user_id.name;
                }else{
                    notification_userid=match.user_id._id;
                    answered_username=match.liked_user_id.name;
                }
                var fcmdata=await FcmDevice.findOne({user_id:notification_userid});
                if (fcmdata) {
                    var message = {
                        to: fcmdata.device_token,
                        collapse_key: 'your_collapse_key', 
                        data: {
                            priority:"high",
                            show_in_foreground: true
                        },
                        notification: {
                            title: 'Sophy App',
                            body: answered_username +" answered a question and waiting on yours."

                        }
                    };
                    console.log("Inside");
                    fcm.send(message, function(err, respo){
                        if (err) {
                            console.log("Something has gone wrong!");
                        } else {
                           
                            console.log("Successfully sent with response: ", respo);
                        
                        }
                    }); 
                     await MatchQuestion.update({_id:matchques._id},{notification:1});
                }
            }
        }
   }
   console.log("done");
}, the_interval);