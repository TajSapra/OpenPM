const pool=require('../config/postgres')
const bcrypt=require('bcrypt')
const saltRounds=10
create_user=function(req, res){

}
check_user=function(req, res){

}
login_page=function(req,res){
    // check for already loggedin users.
    
    return res.render('Login',{
        title:'Login'
    })
}
module.exports={create_user, check_user,login}