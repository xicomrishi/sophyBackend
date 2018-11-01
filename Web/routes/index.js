var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var User = require('../models/user');
var Match = require('../models/match');
// Members Page
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.redirect('/admins/dashboard');
});
router.get('/admins/dashboard', ensureAuthenticated, async function(req, res, next) {
  var all=await User.count();
  var male=await User.count({gender:'Male'});
  var female=await User.count({gender:'Female'});
  var matches=await Match.count({status:'1'});
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
  res.render('index', { title: 'Dashboard' ,success:req.flash('success'),error:req.flash('error'),layout:'layout',url:req.url,'all':all,'male':male,'female':female,'matches':matches,'map':map});
});

// router.get('/admins/mapdata', ensureAuthenticated, async function(req, res, next) {
//   const aggregatorOpts = [
//     {
//         $group: {
//             _id: "$countrycode",
//             count: { $sum: 1 }
//         }
//     }
// ]

//   var map=await User.aggregate(aggregatorOpts).exec();
//     var final=[];
//     for (let ma of map) {
//       var data={value:ma.count};
//       var obj={};
//       obj[ma._id]=data;
//        final.push(obj);
//     }
//    var mapdata={'2009':{
//                   'areas':final
//                 }
//               }
//     // return res.send(mapdata);
//   res.send({'final':JSON.stringify(mapdata)});
// });
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/admins/login');

}

module.exports = router;
