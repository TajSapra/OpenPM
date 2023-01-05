const pool = require("../../config/postgres")
checker=function(req, res){
    if(!req.cookies.User_email)return 3
    if(!req.cookies.User_key)return 3
    const user_email=req.cookies.User_email
    const user_key=req.cookies.User_key
    var query='SELECT * from users where Email=$1'
    pool.query(query, [user_email]).then(results=>{
        if(result.rows.length==0){
            return 0
        }
        if(results.rows[0].User_secret==user_key)return 2
        else return 1
    })
}
module.exports=checker