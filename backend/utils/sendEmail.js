// backend/utils/sendEmail.js
const nodemailer = require('nodemailer')

const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    throw new Error('EMAIL_USER or EMAIL_PASS missing in .env')
  }

  console.log('📧 Attempting to send email via:', user)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  })

  const info = await transporter.sendMail({
    from: `"ANSHIÉ's GLAM" <${user}>`,
    to,
    subject,
    html,
  })

  console.log('✅ Email sent:', info.messageId)
  return info
}

module.exports = sendEmail