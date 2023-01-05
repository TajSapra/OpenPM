const express=require("express");
const bodyParser = require('body-parser')
const path=require('path')
const expresslayout=require('express-ejs-layouts')
const homecontroller=require('./controllers/homecontroller')
const authcontroller=require('./controllers/authcontroller')
const app=express();
const port=process.env.PORT || 3000;
app.use(expresslayout)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true,}))
app.use(express.static('assets'))
app.use(express.urlencoded());         
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.get('/', homecontroller.homepage)
app.post('/auth/create_user', authcontroller.create_user)
app.post('/auth/check_user', authcontroller.check_user_generate_send_OTP)
app.listen(port, function(err){
    if(err){
        console.error("error on loading server" ,err)
    }
    else{
        console.log(`working on port: ${port}`);
    }
})
