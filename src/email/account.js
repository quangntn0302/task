const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENGGRIDID_API_KEY)

const sendWelcomeMail = (email, name) => {
  const msg = {
    to: email,
    from: 'quangntn0302@gmail.com',
    subject: 'This is my first creation',
    text: 'Welcome ' + name
  }
  sgMail.send(msg)
}

module.exports = {
  sendWelcomeMail
}
