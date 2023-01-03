const pool=require('../config/postgres')
const bcrypt=require('bcrypt')
const otpmailer=require('../mails/otpmailer')
const errornotifier=require('../mails/errormailer')
const e = require('express')
const saltRounds=10
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
create_user=function(req, res){
    pool.query('Select * from users where email=$1', [req.body.email]).then(result=>{        
        if(result.rows.length>0){
            res.cookie('display_message', 'User Account Already exists')
            return res.redirect('/login')
        }
        else{
            const hash=bcrypt.hashSync(req.body.email, saltRounds)
            var userdata=[req.body.email, req.body.uname, hash, req.body.org]
            pool.query('INSERT into users(Email, Username, User_id, Organisation) VALUES($1,$2,$3,$4)',userdata)
            return res.redirect('/login')            
        }
    })
}
check_user_generate_send_OTP=function(req, res){
    try{
        const user_email=req.body.user_email
        const query='SELECT * FROM users WHERE Email=$1'
        if(!req.xhr){
            return res.redirect('/auth/logout')
        }
        pool.query(query,[user_email]).then(result=>{        
            if(result.rows.length==0){
                res.clearCookie('display_message')
                res.cookie('display_message', 'Account does not exist. Please sign up first.')
                return res.redirect('/back')
            }
            var otp=randomIntFromInterval(100000,999999)
            otpmailer.verify(user_email, otp)
            const query2='UPDATE users SET OTP=$1 WHERE Email=$2'
            pool.query(query2, [otp, user_email]).then(result2=>{
                res.cookie('User_email', user_email)
                res.json({success : "Updated Successfully", status : 200})
            })
        })
    }
    catch(err){
        errornotifier(err)
        res.json({message:'Error in the action. Please try after some time'})
    }
}
signup_page=function(req,res){
    return res.render('Signup',{
        title:'Signup'
    })
}
login_page=function(req,res){
    // check for already loggedin users.
    return res.render('Login',{
        title:'Login'
    })
}

////todo:
//logout
//create 3 functions 1 for already logged in and other for checkin secret==email and last one for error notification email sender and add try catch everywhere


module.exports={create_user, check_user_generate_send_OTP,login_page, signup_page}