var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admin');
var User = require('../models/user');
var Question = require('../models/question');
var Report = require('../models/report');
var Match = require('../models/match');
var Cms = require('../models/cms');
var Setting = require('../models/setting');
var Dislike = require('../models/dislike');
var FcmDevice = require('../models/fcmdevice');
var MatchQuestion = require('../models/matchquestion');
var MobileShare = require('../models/mobileshare');
var bcrypt = require('bcrypt');
var async = require('async');
var crypto=require('crypto');
var nodemailer=require('nodemailer');
var DataTable = require('mongoose-datatable');
var _ = require('lodash');
var fs = require('fs');
var csv = require("fast-csv");
var lowerCase = require('lower-case');
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {
      'title': 'Register',
      url:req.url
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
      'title': 'Login',
      url:req.url
  });
});

router.post('/profileupdate', function(req, res, next) {
    console.log(req);
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var phone = req.body.phone;

    // Check for Image Field
    if(req.files.profileimage){
        console.log('uploading File...');
        var profileImageOriginalName = req.files.profileimage.originalname;
        var profileImageName = req.files.profileimage.name;

        var profileImageMime = req.files.profileimage.mimetype;
        var profileImagePath = req.files.profileimage.path;
        var profileImageExt = req.files.profileimage.extension;
        var profileImageSize = req.files.profileimage.size;
    }
    else {
        var profileImageName = req.user.profileimage;
    }
     var data={
         firstname:firstname,
         lastname:lastname,
         email:email,
         phone:phone,
         profileimage:profileImageName
    }
    Admin.update({_id:req.user.id},data,function(request,response) {

    });
    req.flash('success', 'Profile Updated Successfully');

    res.location('/');
    res.redirect('/');
});

router.post('/updatepassword', function(req, res, next) {
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;
    var data={
         oldpassword:oldpassword,
         newpassword:newpassword,
         confirmpassword:confirmpassword,
    }
    req.checkBody('oldpassword','Old Password is required').notEmpty();
    req.checkBody('newpassword','New Password is required').notEmpty();
    req.checkBody('confirmpassword','Confirm Password is required').notEmpty();
    req.checkBody('confirmpassword','Password do not match').equals(newpassword);

    //Check for errors
    var errors = req.validationErrors();
    console.log(data);
    if(errors){
    	console.log('yes eror');
			req.flash('error', 'Please fill all details correctly');
			res.redirect('/');
    } else {
    	console.log('yes not eror');
        bcrypt.hash(newpassword, 10, function(err, hash){
        if(err) throw err;
        var pass ={
            password: hash
        };
        
        Admin.update({_id:req.user.id},pass,function(request,response) {
  
        });
	        req.flash('success', 'Password Updated Successfully');
	        res.location('/');
	        res.redirect('/');
      });
    }
});
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      Admin.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "info.babzer@gmail.com",
          pass: "babzer12345"
        }
      });
      const FROM_ADDRESS = 'support@sophy.com';
        var mailOptions = {
          from: "Sophy <" + FROM_ADDRESS + ">",
          to: user.email,
          replyTo: FROM_ADDRESS,
          subject: 'Sophy Admin Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
           'http://' + req.headers.host + '/admins/reset/' + token + '\n\n' +
           'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/reset/:token', function(req, res) {
  Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        bcrypt.hash(req.body.password, 10, function(err, hash){
        if(err) throw err;
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
           user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "info.babzer@gmail.com",
          pass: "babzer12345"
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      const FROM_ADDRESS = 'support@sophy.com';
      var mailOptions = {
          from: "Sophy <" + FROM_ADDRESS + ">",
          to: user.email,
          replyTo: FROM_ADDRESS,
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Admin.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
    function(username, password, done){
        Admin.getUserByUsername(username, function(err, user){
          var message='';
            if(err) throw err;
            if(!user){
                console.log('Unknown User');
                return done(null, false, {message: 'Unknown User'});
            }

            Admin.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    console.log('Invalid Password');
                    return done(null, false, {message: 'Invalid Password'});
                }
            });
        });
    }
));

router.post('/login', passport.authenticate('local',{failureRedirect: '/admins/login', failureFlash: ''}), function(req, res){
    console.log('Authentication Successful');
    // req.flash('success', 'You are logged in');
    res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();
    // req.flash('success', 'You have logged out');
    res.redirect('/admins/login');
});

router.get('/profile', ensureAuthenticated,function(req, res){
    res.render('profile', {
      'title': 'Profile',
      layout:'layout',
      url:req.url
    });
});
router.get('/userlist', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    res.render('userlist', {
      'title': 'User List',
      layout:'layout',
      url:req.url
    });
});
router.get('/userdata',function(req, res){
  User.dataTable(req.query,{conditions: {profile: 'complete',delete:0,status:'active'}}, function (err, tdata) {
    var dataRow = '';
    var image = '';
    var ndata=[]             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);
      // if (value.status=='deactive') {
      //     var status='deactive';
      // }else{
      //    var status='active';
      // }
        dataRow='<a href="/admins/status/'+value._id+'" data-id="'+value._id+'" class="userclick" rel="'+value.status+'">'+'block'+'</a> | '+'<a href="/admins/view/'+value._id+'" data-id="'+value._id+'">View</a> | '+  
        '<a href="javascript:;" data-id="'+value._id+'" class="userdelete" >Delete</a>'; 
        // var obj=value.toObject({ getters: true });           
        var obj=value;
        if (value.images) {
          var img=JSON.parse(value.images);
           image='<a href="javascript:;" class="strp"><img src="http://18.216.167.102:3001/'+img[0]+'" style="width:50%;"/></a>';  
        }else{
          image='<img src="/images/dummy.png" class="strp"  style="width:50%;"/>';
        }
        var obj2={button:dataRow,images:image};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
    //  res.json({
    //   data: ndata,
    //   recordsFiltered: tdata.total,
    //   recordsTotal: tdata.total
    // });
  });   
});
router.post('/change-status/:id/:status',function(req, res){
     console.log(req.params.id);
     if (req.params.status=='active') {
       var status='deactive';
       var response='unblock';
     }else{
       var status='active';
       var response='block';
     }
     var data={
          status:status
     }
     User.update({_id:req.params.id},data,function(ureq,ures) {
        var result={
              status:status,
              data:ures,
              response:response,
              message:'status updated Successfully'
        }
        res.json(result);
     })
});

router.get('/delete/:id',ensureAuthenticated, async (req, res, next) => {
  try {
    var userId=req.params.id;
    const user = await User.findOne({_id:userId}).remove();
    if (user) {
        const matches = await Match.find({$or: [{user_id:userId},{liked_user_id:userId}]});
        var match_ids=[];
        if (matches) {
          for (let mval of matches) {
              match_ids.push(mval._id);
          } 
          const matchquestion = await MatchQuestion.find({_id:{$in:match_ids}}).remove();
        }
        const settings = await Setting.find({user_id:userId}).remove();
        const report = await Report.find({$or: [{user_id:userId},{report_user_id:userId}]}).remove();
        const dislike = await Dislike.find({$or: [{user_id:userId},{dislike_user_id:userId}]}).remove();
        const fcmdevice = await FcmDevice.find({user_id:userId}).remove();
        const mobileshare = await MobileShare.find({user_id:userId}).remove();
        const match = await Match.find({$or: [{user_id:userId},{liked_user_id:userId}]}).remove();
        var result={
              status:'success',
              message:'User deleted Successfully'
        }
        res.json(result);
    }
  } catch (e) {
    next(e) 
  }
})

router.get('/match-delete/:id',ensureAuthenticated, async (req, res, next) => {
  try {
    var matchId=req.params.id;
    const matches = await Match.findOne({_id:matchId}).remove();
    if (matches) {
        const mobileshare = await MobileShare.find({match_id:matchId}).remove();
        const matchquestion = await MatchQuestion.find({match_id:matchId}).remove();
        var result={
              status:'success',
              message:'Match deleted Successfully'
        }
        res.json(result);
    }
  } catch (e) {
    next(e) 
  }
})

router.post('/multi-delete',ensureAuthenticated, async (req, res, next) => {
  try {
    var userIds=req.body.user_ids.split(",");
    const user = await User.find({_id:{$in:userIds}}).remove();
    if (user) {
        const matches = await Match.find({$or: [{user_id:{$in:userIds}},{liked_user_id:{$in:userIds}}]});
        var match_ids=[];
        if (matches) {
          for (let mval of matches) {
              match_ids.push(mval._id);
          } 
          const matchquestion = await MatchQuestion.find({_id:{$in:match_ids}}).remove();
        }
        const settings = await Setting.find({user_id:{$in:userIds}}).remove();
        const report = await Report.find({$or: [{user_id:{$in:userIds}},{report_user_id:{$in:userIds}}]}).remove();
        const dislike = await Dislike.find({$or: [{user_id:{$in:userIds}},{dislike_user_id:{$in:userIds}}]}).remove();
        const fcmdevice = await FcmDevice.find({user_id:{$in:userIds}}).remove();
        const mobileshare = await MobileShare.find({user_id:{$in:userIds}}).remove();
        const match = await Match.find({$or: [{user_id:{$in:userIds}},{liked_user_id:{$in:userIds}}]}).remove();
        var result={
              status:'success',
              message:'Users deleted Successfully'
        }
        res.json(result);
    }
  } catch (e) {
    next(e) 
  }
})

router.post('/user-delete/:id',ensureAuthenticated,function(req, res){
     console.log(req.params.id);
     User.find({_id:req.params.id}).remove(function(ureq,ures) {
        var result={
              status:'success',
              message:'User deleted Successfully'
        }
        res.json(result);
     })
});
router.get('/add-user', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    res.render('add-user', {
      'title': 'userlist',
      layout:'layout',
      url:req.url
    });
});
router.get('/edit/:id',ensureAuthenticated,function(req, res){
     console.log(req.params.id);
     User.findOne({_id:req.params.id},function(ureq,ures) {
      res.render('edit-user', {
          'title': 'Edit User',
          layout:'layout',
          url:req.url,
          data:ures
        });
     })
});
router.post('/adduser',ensureAuthenticated, function(req, res, next) {
    console.log(req);
    var name = req.body.name;
    var phone = req.body.phone;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var seeking = req.body.seeking;
    var country = req.body.country;
    // Check for Image Field
    if(req.files.images){
        console.log('uploading File...');
        var profileImageOriginalName = req.files.images.originalname;
        var profileImageName = req.files.images.name;

        var profileImageMime = req.files.images.mimetype;
        var profileImagePath = req.files.images.path;
        var profileImageExt = req.files.images.extension;
        var profileImageSize = req.files.images.size;
    }
    else {
        var profileImageName = '';
    }
     var data={
         name:name,
         mobile:phone,
         dob:dob,
         gender:gender,
         seeking:seeking,
         images:profileImageName,
         country:country
    }
    console.log(data);
    User.create(data,function(request,response) {

    });
    req.flash('success', 'User added Successfully');

    res.location('/admins/userlist');
    res.redirect('/admins/userlist');
});

router.post('/updateuser',ensureAuthenticated, function(req, res, next) {
    console.log(req);
    var name = req.body.name;
    var _id = req.body.id;
    var phone = req.body.phone;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var seeking = req.body.seeking;

    // Check for Image Field
    if(req.files.images){
        console.log('uploading File...');
        var profileImageOriginalName = req.files.images.originalname;
        var profileImageName = req.files.images.name;

        var profileImageMime = req.files.images.mimetype;
        var profileImagePath = req.files.images.path;
        var profileImageExt = req.files.images.extension;
        var profileImageSize = req.files.images.size;
    }
    else {
        var profileImageName = req.body.oldimage;
    }
     var data={
         name:name,
         mobile:phone,
         dob:dob,
         gender:gender,
         seeking:seeking,
         images:profileImageName
    }
    console.log(data);
    User.update({_id:_id},data,function(request,response) {

    });
    req.flash('success', 'User updated Successfully');

    res.location('/admins/userlist');
    res.redirect('/admins/userlist');
});

router.get('/view/:id', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    User.findOne({_id:req.params.id},function(ureq,ures) {
      Match.find({$and: [{ $or: [{ user_id:req.params.id },{ liked_user_id:req.params.id }] },{ $or: [{ status:1 }] }]}).populate('user_id').populate('liked_user_id').exec(function(mreq,mres) {
        var matchdata=[];
         if (mres) {
            mres.forEach(function(value,index){  
                var obj=value.toObject({ getters: true }); 
                if (value.liked_user_id._id!=req.params.id) {
                  if (value.liked_user_id.images) {
                    var img=JSON.parse(value.liked_user_id.images);
                     image='<div class="matchuserpic"><img src="http://18.216.167.102:3001/'+img[0]+'"/></div>';  
                  }else{
                     image='<div class="matchuserpic"><img src="/images/dummy.png"/></div>';
                  }
                  var obj2={name:value.liked_user_id.name,country:value.liked_user_id.country,gender:value.liked_user_id.gender,mobile:value.liked_user_id.mobile,images:image};
                }
                
                if (value.user_id._id!=req.params.id) {  
                  if (value.user_id.images) {
                    var img=JSON.parse(value.user_id.images);
                     image='<div class="matchuserpic"><img src="http://18.216.167.102:3001/'+img[0]+'"/></div>';  
                  }else{
                     image='<div class="matchuserpic"><img src="/images/dummy.png"/></div>';
                  }
                  var obj2={name:value.user_id.name,country:value.user_id.country,gender:value.user_id.gender,mobile:value.user_id.mobile,images:image};

                }    
                
                var obj3={liked_user_id:obj2,};
                _.merge(obj, obj3);
                matchdata.push(obj);
            })
         }
         var obj=ures.toObject({ getters: true }); 
         if (ures.images) {
           var img=JSON.parse(ures.images);
           obj.images=img;
         }
         res.render('view-user', {
          'title': 'View User',
          layout:'layout',
          url:req.url,
          data:obj,
          image:obj.images[0],
          match:matchdata
        });
      })
    })
});

router.get('/add-question', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('add-question', {
          'title': 'Add Question',
          layout:'layout',
          url:req.url
        });
});

router.post('/add-question', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
  console.log(req);
    var question = req.body.question;
    var category = req.body.category;
    var type = req.body.type;
    var owner = req.body.owner;
    var option1 = req.body.option1;
    var option2 = req.body.option2;
    var option3 = req.body.option3;
    var option4 = req.body.option4;
    var data={
         question:question,
         category:category,
         type:type,
         owner:owner,
         option1:option1,
         option2:option2,
         option3:option3,
         option4:option4
       }
    console.log(data);
    Question.create(data,function(request,response) {

    });
    req.flash('success', 'Question added Successfully');
    if (category=='deep') {
         res.location('/admins/deep-question');
         res.redirect('/admins/deep-question');
    }else{
        res.location('/admins/basic-question');
        res.redirect('/admins/basic-question');
    }   
});

router.get('/basic-question', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('basic-questionlist', {
          'title': 'Basic Question',
          layout:'layout',
          url:req.url
        });
});

router.get('/basic-questionlist',function(req, res){
  Question.dataTable(req.query,{conditions: {category: 'basic'}}, function (err, tdata) {
    var dataRow = '';
    var image = '';
    var ndata=[]             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);
      if (value.status=='deactive') {
          var status='deactive';
      }else{
         var status='active';
      }
        dataRow='<a href="/admins/question-status/'+value._id+'" data-id="'+value._id+'" class="userclick" rel="'+status+'">'+status+'</a> | '+  
                    '<a href="/admins/edit-question/'+value._id+'/basic" data-id="'+value._id+'">Edit</a> | '+  
                    '<a href="/admins/delete-question/'+value._id+'" class="qdelete" data-id="'+value._id+'">Delete</a>'; 
        var obj=value;
        var obj2={button:dataRow};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.get('/deep-question', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('deep-questionlist', {
          'title': 'Deep Question',
          layout:'layout',
          url:req.url
        });
});

router.get('/deep-questionlist',function(req, res){
  Question.dataTable(req.query,{conditions: {category: 'deep'}}, function (err, tdata) {
    var dataRow = '';
    var image = '';
    var ndata=[]             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);
      if (value.status=='deactive') {
          var status='deactive';
      }else{
         var status='active';
      }
        dataRow='<a href="/admins/question-status/'+value._id+'" data-id="'+value._id+'" class="userclick" rel="'+status+'">'+status+'</a> | '+  
                    '<a href="/admins/edit-question/'+value._id+'/deep" data-id="'+value._id+'">Edit</a> | '+  
                    '<a href="/admins/delete-question/'+value._id+'" class="qdelete" data-id="'+value._id+'">Delete</a>'; 
        var obj=value;
        var obj2={button:dataRow};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.post('/question-status/:id/:status',function(req, res){
     console.log(req.params.id);
     if (req.params.status=='active') {
       var status='deactive'
     }else{
       var status='active';
     }
     var data={
          status:status
     }
     Question.update({_id:req.params.id},data,function(ureq,ures) {
        var result={
              status:status,
              message:'status updated Successfully'
        }
        res.json(result);
     })
});

router.post('/question-delete/:id',ensureAuthenticated,function(req, res){
     console.log(req.params.id);
     Question.find({_id:req.params.id}).remove(function(ureq,ures) {
        var result={
              status:'success',
              message:'Question deleted Successfully'
        }
        res.json(result);
     })
});

router.get('/edit-question/:id/:type',ensureAuthenticated,function(req, res){
     console.log(req.params.id);
     Question.findOne({_id:req.params.id},function(ureq,ures) {
      if (req.params.type=='basic') {
         var url='/admins/basic-question';
      }else{
         var url='/admins/deep-question';
      }
      res.render('edit-question', {
          'title': 'Edit Question',
          layout:'layout',
          url:url,
          data:ures
        });
     })
});

router.get('/compliant-list', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('compliant-list', {
          'title': 'Complient List',
          layout:'layout',
          url:req.url
        });
});

router.get('/compliants',function(req, res){
  Report.dataTable(req.query, function (err, tdata) {
    var dataRow = '';
    var ndata=[];             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);
      if (value.status=='closed') {
          var status='closed';
      }else{
         var status='open';
      }
        dataRow='<a href="/admins/compliant-status/'+value._id+'" data-id="'+value._id+'" class="userclick" rel="'+status+'">'+status+'</a> | '+  
                    '<a href="/admins/compliant-delete/'+value._id+'" class="qdelete" data-id="'+value._id+'">Delete</a> | '+  
                    '<a href="/admins/compliant-view/'+value._id+'" class="view" data-id="'+value._id+'">View</a>'; 
        var obj=value;
        var obj2={button:dataRow};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.post('/compliant-status/:id/:status',function(req, res){
     console.log(req.params.id);
     if (req.params.status=='open') {
       var status='closed'
     }else{
       var status='open';
     }
     var data={
          status:status
     }
     Report.update({_id:req.params.id},data,function(ureq,ures) {
        var result={
              status:status,
              message:'status updated Successfully'
        }
        res.json(result);
     })
});

router.post('/compliant-delete/:id',ensureAuthenticated,function(req, res){
     console.log(req.params.id);
     Report.find({_id:req.params.id}).remove(function(ureq,ures) {
        var result={
              status:'success',
              message:'Report deleted Successfully'
        }
        res.json(result);
     })
});

router.get('/compliant-view/:id', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    Report.findOne({_id:req.params.id}).populate('user_id').populate('report_user_id').exec(function(ureq,ures) {
    Report.find({_id:{ $ne: req.params.id }}).populate({
    "path": "user_id",
    "match": { "_id": ures.user_id._id}
    }).populate('report_user_id').exec(function(mreq,mres) {
      docs = mres.filter(function(doc){
         return doc.user_id != null;
       })
        var current;
        if (ures.user_id.status=='active') {
           var current='block';
        }else{
           var current='unblock';
        }
         res.render('view-compliant', {
          'title': 'View Complient',
          layout:'layout',
          url:req.url,
          data:ures,
          current:current,
          other:docs
        });
      })
    })
});

router.post('/update-question', function(req, res, next) {
    var question = req.body.question;
    var category = req.body.category;
    var type = req.body.type;
    var option1 = req.body.option1;
    var option2 = req.body.option2;
    var option3 = req.body.option3;
    var option4 = req.body.option4;
    var data={
         question:question,
         category:category,
         type:type,
         option1:option1,
         option2:option2,
         option3:option3,
         option4:option4
       }
    console.log(data);
    Question.update({_id:req.body._id},data,function(request,response) {

    });
    req.flash('success', 'Question Updated Successfully');
    if (category=='deep') {
         res.location('/admins/deep-question');
         res.redirect('/admins/deep-question');
    }else{
        res.location('/admins/basic-question');
        res.redirect('/admins/basic-question');
    } 
});

router.get('/match-list', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('match-list', {
          'title': 'Match List',
          layout:'layout',
          url:req.url
        });
});

router.get('/matchdata',function(req, res){
  Match.dataTable(req.query,{conditions: {status: 1}}, function (err, tdata) {
    var dataRow = '';
    var ndata=[];             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);
      if (!value.date) {
          var date='No Date';
      }else{
         var date=value.date;
      }
      dataRow='<a href="javascript:;" data-id="'+value._id+'" class="matchdelete" >Delete</a>'; 

        var obj=value;
        var obj2={button:dataRow,date:date};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.get('/upload-question', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
         res.render('upload-question', {
          'title': 'Upload Question',
          layout:'layout',
          url:req.url
        });
});
router.post('/upload-question', ensureAuthenticated,function(req, res){
  if(req.files.csv){
        console.log('uploading File...');

        var csvName = req.files.csv.name;
        var csvPath = req.files.csv.path;
        console.log(csvName);
        console.log(csvPath);
        var questions=[];
        fs.exists(csvPath, function(exists) {
        if (exists) { //test make sure the file exists
            // var stream = fs.createReadStream(csvPath);
            // csv.fromStream(stream, {headers : ["question","category","type","option1","option2","option3","option4"]}).on("data", function(data){
            //  res.send(data);
            // }) 
            var stream = fs.createReadStream(csvPath).pipe(csv.parse({headers: true})).transform(function (row) {
                return {
                    question: row.Question,
                    category: lowerCase(row.Category),
                    type: lowerCase(row.Type),
                    option1: row.Option1,
                    option2: row.Option2,
                    option3: row.Option3,
                    option4: row.Option4,
                    owner: row.Owner
                };
            }).on("readable", function () {
                var row;
                while (null !== (row = stream.read())) {
                    console.log(row);
                    questions.push(row);
                }
            })
            .on("end",function function_name(ereq,eres) {
              // var dupes = [];
              // var finalques = [];
              //   questions.forEach(function(entry,index){  
              //     if (!dupes[entry.question]) {
              //         dupes[entry.question] = true;
              //         finalques.push(entry);
              //     }
              // });
                // Question.insertMany(questions,function(ireq,ires) {
                //    res.render('upload-question', {
                //       'title': 'Upload Question',
                //       layout:'layout',
                //       uploaded:true,
                //       url:req.url
                //     });
                // })
                for (let mval of questions) {
                  Question.findOne({question:mval.question}).exec(function(creq,cres) {
                     if (!cres) {
                      console.log('here find')
                         Question.create(mval,function(cr,cs) {
                     
                         }) 
                      }
                  });
                } 
                res.render('upload-question', {'title': 'Upload Question',layout:'layout',uploaded:true,url:req.url});
            });
        }
      });
    }
});

router.get('/blocked-userlist', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    res.render('blocked-userlist', {
      'title': 'Blocked Users List',
      layout:'layout',
      url:req.url
    });
});
router.get('/blocked-userdata',function(req, res){
  User.dataTable(req.query,{conditions: {profile: 'complete',status: 'deactive'}}, function (err, tdata) {
    var dataRow = '';
    var image = '';
    var ndata=[]             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);

        dataRow='<a href="/admins/status/'+value._id+'" data-id="'+value._id+'" class="userclick" rel="deactive">unblock</a> | '+  
                    '<a href="/admins/view/'+value._id+'" data-id="'+value._id+'">View</a>'; 
        // var obj=value.toObject({ getters: true });           
        var obj=value;
        if (value.images) {
          var img=JSON.parse(value.images);
           image='<img src="http://18.216.167.102:3001/'+img[0]+'" style="width:50%;"/>';  
        }else{
          image='<img src="/images/dummy.png" style="width:50%;"/>';
        }
        var obj2={button:dataRow,images:image};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.get('/terms-conditions', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
  Cms.findOne({type:"terms"},function (creq,cres) {
      res.render('cms', {
          'title': 'Terms & conditions',
          data:cres,
          layout:'layout',
          url:req.url
      });
  })
});

router.get('/privacy-policy', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
  Cms.findOne({type:"policy"},function (creq,cres) {
      res.render('cms', {
          'title': 'Privacy Policy',
          data:cres,
          layout:'layout',
          url:req.url
      });
  })
});

router.post('/update-content', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
  var d = new Date(),month = '' + (d.getMonth() + 1),day = '' + d.getDate(),year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  var date=[day,month,year].join('-');
  Cms.update({type:req.body.type},{content:req.body.content,date:date},function(ureq,ures) {
    console.log(ures);
      req.flash('success', 'Cms Updated Successfully');
      res.location('/');
      res.redirect('/');
   })
});

router.get('/deactivated-userlist', ensureAuthenticated,function(req, res){
  console.log("here "+ req.url);
    res.render('deactivated-userlist', {
      'title': 'Deactived Users List',
      layout:'layout',
      url:req.url
    });
});
router.get('/deactivated-userdata',function(req, res){
  User.dataTable(req.query,{conditions: {profile: 'complete',delete: '1'}}, function (err, tdata) {
    var dataRow = '';
    var image = '';
    var ndata=[]             
    tdata.data.forEach(function(value,index){  
      console.log("value is " + value +' '+ "index is" +index);

        dataRow='<a href="/admins/view/'+value._id+'" data-id="'+value._id+'">View</a>'; 
        // var obj=value.toObject({ getters: true });           
        var obj=value;
        if (value.images) {
          var img=JSON.parse(value.images);
           image='<img src="http://18.216.167.102:3001/'+img[0]+'" style="width:50%;"/>';  
        }else{
          image='<img src="/images/dummy.png" style="width:50%;"/>';
        }
        var obj2={button:dataRow,images:image};
        _.merge(obj, obj2);
        ndata.push(obj);
    }); 
    _.merge(tdata, ndata);
    res.send(tdata);
  });   
});

router.get('/mapdata', ensureAuthenticated, async function(req, res, next) {
  const aggregatorOpts = [
    {
        $group: {
            _id: "$countrycode",
            country : { $first: '$country' },
            count: { $sum: 1 }
        }
    }
]

  var map=await User.aggregate(aggregatorOpts).exec();
    var final=[];
    for (let ma of map) {
      var data={value:ma.count,tooltip: {
                                content: "<span style=\"font-weight:bold;\">"+ma.country +"</span><br />Users :"+ ma.count
                            }};
      var obj={};
      obj[ma._id]=data;
       final.push(obj);
    }
   var mapdata={
                  'areas':final
                }
              
    // return res.send(mapdata);
  res.send(mapdata);
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/admins/login');

}
module.exports = router;
