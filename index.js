const express=require("express");
const homecontroller=require('./controllers/homecontroller')
const authcontroller=require('./controllers/authcontroller')
const app=express();
const port=process.env.PORT || 3000;
app.post('/auth/create_user', authcontroller.create_user)
app.post('/auth/check_user', authcontroller.check_user)
app.listen(port, function(err){
    if(err){
        console.error("error on loading server" ,err)
    }
    else{
        console.log(`working on port: ${port}`);
    }
})
