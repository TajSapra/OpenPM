const nodeMailer=require('../config/nodemailer');
const tokens=require('../tokens/tokens')
exports.verify=(email, otp)=>{
    let Htmlstring= nodeMailer.renderTemplate({
        emailid:email,
        otp:otp,
        date:Date()
    }, '/emailotp.ejs');
    nodeMailer.transporter.sendMail({
        from:tokens.emailid,
        to:email,
        subject:"Email Verification OTP",
        html:Htmlstring
    },function(err,info){
        if(err){
            console.log(err)
        }
    });
}