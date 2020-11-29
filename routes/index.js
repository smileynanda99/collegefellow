const express = require('express');
const router = express.Router();
const mailgun = require('mailgun-js');
const API_KEY = process.env.APPSETTING_SG_MAIL_API_KEY || process.env.SG_MAIL_API_KEY;
const DOMAIN = 'collegefellow.social';
const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

router.get('/', (req, res) => res.render('index'));

router.post('/', (req, res) =>{
    async function sendEmail(msg){
        sgMail.send(msg, function(err, json) {
          if (err) { return console.error(err); }
        });
    };
    const { name, email, phoneNo, message} = req.body;
    const data = {
        from: 'CF Feedback <smileynanda99@gmail.com>',
        to: 'smileynanda100@gmail.com',
        subject: 'College fellowers- Feed Back!',
        text:`feedback`,
        html:`<h2 style="color: #d03737" >Name: ${name}</h2>
        <h4>Email: ${email}</h4>
        <h4>Mobile No: ${phoneNo}</h4>
        <p>Message: ${message}</p>`
      }
      mg.messages().send(data, function (error, body) {
        if(error){
            console.log(error);
        }
    });  
    res.redirect('/');
});

module.exports = router;