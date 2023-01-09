const express=require("express");
const bodyParser = require('body-parser')
const path=require('path')
const cookies=require('cookie-parser')
const tokens=require('./tokens/tokens')
const session=require('express-session')
const expresslayout=require('express-ejs-layouts')
const homecontroller=require('./controllers/homecontroller')
const appcontroller=require('./controllers/appcontroller')
const dashboardcontroller=require('./controllers/dashboardcontroller')
const passport = require('passport');
const authcontroller=require('./controllers/authcontroller')
const sessionPool = require('pg').Pool
const { Client } = require('pg')
const googlestrat =require('./config/passport-google')
const app=express();
const port=process.env.PORT || 3000;
const pgSession = require('connect-pg-simple')(session)
const sessionDBaccess = new sessionPool({
    user: 'postgres',
    host: 'localhost',
    database: 'OpenPM',
    password: tokens.postgrespassword,
    port: 5432
})
app.use(session({
    store: new pgSession({
        pool: sessionDBaccess,
        tableName: 'session'
    }),
    name:'loginsessions',
    secret:'secret',
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, 
    resave: false, 
    saveUninitialized: false,   
}))
app.use(cookies())
app.use(expresslayout)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true,}))
app.use(express.static('assets'))
app.use(express.urlencoded());         
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(passport.initialize())
app.use(passport.session())
app.get('/login/oauth/google/', passport.authenticate('google',{scope:['profile','email'] }))
app.get('/login/outh/google/callback', passport.authenticate('google', {failureRedirect:'/login'}), function(req,res){
    return res.redirect('/dashboard')
})

app.get('/', homecontroller.homepage)

app.get('/auth/login', authcontroller.login_page)
app.get('/auth/signup', authcontroller.signup_page)
app.get('/logout', authcontroller.logout)
app.post('/auth/verify_otp', authcontroller.verify_otp)
app.post('/auth/create_user', authcontroller.create_user)
app.post('/auth/check_user', authcontroller.check_user_generate_send_OTP)

app.get('/dashboard', dashboardcontroller.profile_page)
app.get('/app/projects',appcontroller.project_list)
app.post('/app/create_new_project', appcontroller.createnewproject)
app.post('/app/getproject_details', appcontroller.getproject_details)
app.get('/app/view_project/:id', appcontroller.viewproject)
app.listen(port,'0.0.0.0', function(err){
    if(err){
        console.error("error on loading server" ,err)
    }
    else{
        //console.log(`working on port: ${port}`);
    }
})
