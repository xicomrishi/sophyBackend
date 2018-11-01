var express = require('express');
var bodyparser = require('body-parser');
var multer = require('multer');
var path = require('path');
var jade = require('jade');
var nodemailer = require("nodemailer");
const fs = require('fs');
var uniqid = require('uniqid')
var app = express();
var FCM = require('fcm-push');
var apn = require("apn"); 
var jwt=require('jsonwebtoken');
var router=express.Router();
app.use(bodyparser.json({
	limit: '10mb'
}));
app.use(bodyparser.urlencoded({
	extended: true,
	limit: '10mb'
}));
app.use(express.static(path.join(__dirname, '/images')));
app.listen(3001, function () {
	console.log('server start');
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var savePath = __dirname + '/images';
        cb(null, savePath)
    },
    filename: function (req, file, cb) {
        cb(null, uniqid() + '-' + file.originalname);
    }
    })
    var uploadPics = multer({
        storage: storage
    })
var controller = require('./controller');
app.get('/s3',function (request,response) {
	// response.send('Welcome to Sophy_App Server');
    response.sendFile('page.html', {
        root: __dirname
    });
});
process.env.SECRET_KEY="5b0ce1bcc8396e65fca49958";
app.use('/secure-api',router);
// validation middleware
router.use(function(req,res,next){
    var token=req.body.token || req.headers['token'];
    if(token){
        jwt.verify(token,process.env.SECRET_KEY,function(err,ress){
            if(err){
                var result={
        	        status:0,
        	      message:'Invalid token'
                }
                return res.send(result);
            }else{
                next();
            }
        })
    }else{
        var result={
        	status:0,
        	message:'Please send a token'
        }
        return res.send(result);
    }
})
router.get('/check',function(req,res){
    res.send('Token Verified')
});
app.post('/admin', controller.admin);
app.get('/dummyusers', controller.dummyusers);
app.post('/otp', controller.otp);
app.post('/otpverify', controller.otpverify);
app.post('/signup', controller.signup);
app.post('/cms', controller.cms);
var cpUpload = uploadPics.fields([{
        name: 'images',
        maxCount: 8
    }])
app.get('/notification', controller.notification);
router.post('/uploadimages',cpUpload, controller.uploadimages);
router.post('/nearbyusers', controller.nearbyusers);
router.post('/me', controller.me);
router.post('/like', controller.like);
router.post('/userdetails', controller.userdetails);
router.post('/settings', controller.settings);
router.post('/report', controller.report);
router.post('/delete-account', controller.deleteaccount);
router.post('/edit-profile',cpUpload, controller.editprofile);
router.post('/match-list', controller.match);
router.post('/match-questions', controller.matchquestions);
router.post('/swipe-images', controller.swipe);
router.post('/answer', controller.answer);
router.post('/user-settings', controller.usersettings);
router.post('/mobile-share', controller.mobileshare);
router.post('/add-device', controller.pushnotification);
router.post('/logout', controller.logout);
router.post('/push-notification', controller.notification);
router.post('/new-questions', controller.refresh);
router.post('/update-questions', controller.uq);