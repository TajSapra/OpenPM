const nodeMailer=require('../config/nodemailer');
const tokens=require('../tokens/tokens')
exports.notify=(otp)=>{
    let Htmlstring= nodeMailer.renderTemplate({
        otp:otp,
        date:Date()
    }, '/error_notify_mail.ejs');
    nodeMailer.transporter.sendMail({
        from:tokens.emailid,
        to:'sapra.taj@gmail.com',
        subject:"Error Notification",
        html:Htmlstring
    },function(err,info){
        if(err){
            console.log(err)
        }
    });
}