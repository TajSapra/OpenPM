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
    pool.query('Select * from users where mail=$1', [req.body.User_email]).then(result=>{        
        if(result.rows.length>0){
            res.cookie('display_message', 'User Account Already exists')
            return res.redirect('/auth/login')
        }
        else{
            const hash=bcrypt.hashSync(req.body.User_email, saltRounds)
            var userdata=[req.body.User_email, req.body.User_name, hash, req.body.User_org]
            pool.query('INSERT into users(mail, username, user_secret, organisation) VALUES($1,$2,$3,$4)',userdata)
            res.cookie('display_message', 'New Account Created')
            return res.redirect('/auth/login')            
        }
    })
}
check_user_generate_send_OTP=function(req, res){
    try{
        var option=login_checker(req)
        console.log(option)
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
        const query='SELECT * FROM users WHERE mail=$1'
        // if(!req.xhr){
        //     console.log("Here!!!")
        //     return res.redirect('/logout')
        // }
        pool.query(query,[user_email]).then(result=>{        
            var otp=randomIntFromInterval(100000,999999)
            console.log("Here3", otp)
            otpmailer.verify(user_email, otp)
            const query2='UPDATE users SET otp=$1 WHERE mail=$2'
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
    var option=login_checker(req)
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
        title:'Signup',
        login: false
    })
}
login_page=function(req,res){
    // check for already loggedin users.
    var option=login_checker(req)
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
        title:'Login',
        login: false
    })
}
logout=function(req,res){ 
    res.clearCookie('User_email')
    res.clearCookie('User_key')
    res.clearCookie('loginsessions')
    res.cookie('display_message', 'Successfully logged out')
    console.log("here" ,req.cookies)
    return res.redirect('/')
}
verify_otp=function(req,res){
    try{
        if(!req.xhr){
            return res.redirect('/logout')
        }
        var option=login_checker(req)
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
        var user_email=req.body.User_email
        console.log(user_email, submitted_otp)
        var query='Select * from users where mail=$1'
        pool.query(query, [user_email]).then(results=>{
            console.log(submitted_otp, results.rows[0].otp,results.rows[0].otp==submitted_otp )
            if(submitted_otp!=results.rows[0].otp){
                res.json({error:'Authentication Error. Wrong OTP'})
            }
            else{
                res.json({success:'Logged In Successfully.', key:results.rows[0].user_secret})
            }
        })
    }
    catch(err){
        // errornotifier(err)
        console.log(err)
        res.json({message:'Error in the action. Please try after some time'})
    }
}

module.exports={create_user, check_user_generate_send_OTP,login_page, signup_page, logout, verify_otp}