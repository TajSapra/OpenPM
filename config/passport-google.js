const tokeninput=require('../tokens/tokens');
const loginmailer=require('../mails/login')
const passport=require('passport')
const saltRounds=10
const bcrypt=require('bcrypt')
const google=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const pool = require('./postgres');
passport.use(new google({
    clientID:tokeninput.passgooclientID,
    clientSecret:tokeninput.passgoogclientSecret,
    callbackURL:"http://localhost:3000/login/outh/google/callback"
},function(access, refresh, profile, done){
    var query='Select * from users where mail=$1'
    pool.query(query, [profile.emails[0].value]).then(results=>{
        if(results.rows.length>0){
            loginmailer.login(results.rows[0])
            return done(null,results.rows[0])
        }
        else{
            var username= profile.displayName
            var email=profile.emails[0].value
            var org="Not Defined"
            var key=bcrypt.hashSync(email, saltRounds)
            var query2='Insert into users(mail, username, user_secret, organisation) values($1,$2,$3,$4)'
            pool.query(query2, [email, username, key, org])
            pool.query(query,[email]).then(results2=>{
                return done(null, results2.rows[0])
            })
        }
    })
}
))
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});
module.exports=passport