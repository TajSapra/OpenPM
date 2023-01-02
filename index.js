const express=require("express");
const app=express();
const port=process.env.PORT || 3000;

app.listen(port, function(err){
    if(err){
        console.error("error on loading server" ,err)
    }
    else{
        console.log(`working on port: ${port}`);
    }
})
