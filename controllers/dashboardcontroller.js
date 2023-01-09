const passport = require('passport')
const pool = require('../config/postgres')
const login_checker=require('./services/login_checker')
profile_page=function(req,res){
    var option=login_checker(req)
    if(option!=2){
        return res.redirect('/logout')
    }
    if(req.cookies.loginsessions){
        var sess=req.cookies.loginsessions.split('.')[0].slice(2)
        var query='Select sess from session where sid=$1'
        pool.query(query, [sess]).then(results=>{
            var req_json=results.rows[0]["sess"]["passport"]["user"]
            res.cookie('User_email', req_json["mail"],{ maxAge: 30 * 24 * 60 * 60 * 1000 })
            res.cookie('User_key', req_json["user_secret"], { maxAge: 30 * 24 * 60 * 60 * 1000 })
        })
    }
    console.log(req.cookies)
    var query='Select * from users where mail=$1'
    var user_email=req.cookies.User_email
    pool.query(query, [user_email]).then(results=>{
        return res.render('dashboard', {
            title:"Dashboard",
            user:results.rows[0],
            login:true
        })
    })
}
module.exports={profile_page}