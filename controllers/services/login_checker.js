const pool = require("../../config/postgres")
checker=function(cookies){
    if(cookies==undefined){
        return 4
    }
    if(cookies.User_email==undefined && cookies.User_key==undefined)return 5
    if(!cookies.User_email)return 3
    if(!cookies.User_key)return 6
    const user_email=cookies.User_email
    const user_key=cookies.User_key
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