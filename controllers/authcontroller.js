const pool=require('../config/postgres')
const bcrypt=require('bcrypt')
const otpmailer=require('../mails/otpmailer')
const login_checker=require('./services/login_checker')
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
        var option=login_checker(req,res)
        if(option==0){
            res.clearCookie('display_message')
            res.cookie('display_message', 'Account does not exist. Please sign up first.')
            return res.redirect('/logout')
        }
        else if(option==1||option ==3){
            res.clearCookie('display_message')
            res.cookie('display_message', 'Error logging in. Please contact the team')
            return res.redirect('/logout')
        }
        else if(option==2){
            res.clearCookie('display_message')
            res.cookie('display_message', 'You are already logged in')
            return res.redirect('/')
        }
        const user_email=req.body.User_email
        const query='SELECT * FROM users WHERE Email=$1'
        if(!req.xhr){
            return res.redirect('/auth/logout')
        }
        pool.query(query,[user_email]).then(result=>{        
            if(result.rows.length==0){
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
        // errornotifier(err)
        res.json({message:'Error in the action. Please try after some time'})
    }
}
signup_page=function(req,res){
    var option=login_checker(req,res)
    if(option==0){
        res.clearCookie('display_message')
        res.cookie('display_message', 'Account does not exist. Please sign up first.')
        return res.redirect('/logout')
    }
    else if(option==1||option ==3){
        res.clearCookie('display_message')
        res.cookie('display_message', 'Error logging in. Please contact the team')
        return res.redirect('/logout')
    }
    else if(option==2){
        res.clearCookie('display_message')
        res.cookie('display_message', 'You are already logged in')
        return res.redirect('/')
    }
    return res.render('Signup',{
        title:'Signup'
    })
}
login_page=function(req,res){
    // check for already loggedin users.
    var option=login_checker(req,res)
    if(option==0){
        res.clearCookie('display_message')
        res.cookie('display_message', 'Account does not exist. Please sign up first.')
        return res.redirect('/logout')
    }
    else if(option==1||option ==3){
        res.clearCookie('display_message')
        res.cookie('display_message', 'Error logging in. Please contact the team')
        return res.redirect('/logout')
    }
    else if(option==2){
        res.clearCookie('display_message')
        res.cookie('display_message', 'You are already logged in')
        return res.redirect('/')
    }
    return res.render('Login',{
        title:'Login'
    })
}
logout=function(req,res){ 
    res.clearCookie('User_email')
    res.clearCookie('User_key')
    res.cookie('display_message', 'Successfully logged out')
    return res.redirect('/')
}
verify_otp=function(req,res){
    try{
        if(!req.xhr){
            return res.redirect('/auth/logout')
        }
        var option=login_checker(req,res)
        if(option==0){
            res.clearCookie('display_message')
            res.cookie('display_message', 'Account does not exist. Please sign up first.')
            return res.redirect('/logout')
        }
        else if(option==1||option ==3){
            res.clearCookie('display_message')
            res.cookie('display_message', 'Error logging in. Please contact the team')
            return res.redirect('/logout')
        }
        else if(option==2){
            res.clearCookie('display_message')
            res.cookie('display_message', 'You are already logged in')
            return res.redirect('/')
        }
        var submitted_otp=req.body.otp
        var user_email=req.cookies.User_email
        var query='Select * from users where Email=$1'
        pool.query(query, [user_email]).then(results=>{
            if(submitted_otp!=results.rows[0].OTP){
                res.json({error:'Authentication Error. Wrong OTP'})
            }
            else{
                res.json({success:'Logged In Successfully.'})
            }
        })
    }
    catch(err){
        // errornotifier(err)
        res.json({message:'Error in the action. Please try after some time'})
    }
}
////todo:
//logout


module.exports={create_user, check_user_generate_send_OTP,login_page, signup_page}