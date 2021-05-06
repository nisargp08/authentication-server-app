import nodemailer from 'nodemailer';

require('dotenv').config();
// A resuable email function which accepts options and other
// config setup is done here
const sendEmail = async (options) => {
  // 1. A transporter object is a service that sends the email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Email options
  const mailOptions = {
    from: 'NP Authentication Services 🔐 <no-reply@np-auth.com>', // sender address
    to: options.to, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plaintext body
    // html: '<b>Hello world 🐴</b>' // html body
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
