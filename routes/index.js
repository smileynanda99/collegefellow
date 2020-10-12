const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SG_MAIL_API_KEY);

router.get('/', (req, res) => res.render('index'));

router.post('/', (req, res) =>{
    async function sendEmail(msg){
        sgMail.send(msg, function(err, json) {
          if (err) { return console.error(err); }
        });
    };
    const { name, email, phoneNo, message} = req.body;
    const msg = {
        from: 'smileynanda99@gmail.com',
        to: 'smileynanda100@gmail.com',
        subject: 'College fellowers- Fead Back!',
        text:`feadback`,
        html:`<h2 style="color: #d03737" >Name: ${name}</h2>
        <h4>Email: ${email}</h4>
        <h4>Mobile No: ${phoneNo}</h4>
        <p>Message: ${message}</p>`
      }
    sendEmail(msg);  
    res.render('index');
});

module.exports = router;