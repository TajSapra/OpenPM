// const login_checker=require('./services/login_checker')
homepage=function(req,res){
    return res.render('Home_page',{
        title:'OpenPM'
    })
    // try{
        // var option=login_checker(req,res)
        // console.log(option)
        // if(option==0){
        //     res.clearCookie('display_message')
        //     res.cookie('display_message', 'Account does not exist. Please sign up first.')
        //     return res.redirect('/logout')
        // }
        // else if(option==1||option ==3){
        //     res.clearCookie('display_message')
        //     res.cookie('display_message', 'Error logging in. Please contact the team')
        //     return res.redirect('/logout')
        // }
        // else if(option==2){
        // }        
    // }
    // catch(err){
    //     // errornotifier(err)
    //     return res.redirect('back')
    // }
}
module.exports={homepage}