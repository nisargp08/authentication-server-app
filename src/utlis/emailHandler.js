import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'express-handlebars';

require('dotenv').config();

export default class Email {
  constructor(req, user) {
    this.to = user.email;
    this.name = user.name;
    this.from = 'apps@nisarg.app';
    this.req = req;
  }

  // To get email api credentials based on environment
  static getTransport() {
    if (process.env.NODE_ENV === 'production') {
      return {
        service: 'SendGrid',
        auth: {
          user: process.env.PROD_EMAIL_USERNAME,
          pass: process.env.PROD_EMAIL_PASSWORD,
        },
      };
    }
    return {
      host: process.env.DEV_EMAIL_HOST,
      port: process.env.DEV_EMAIL_PORT,
      auth: {
        user: process.env.DEV_EMAIL_USERNAME,
        pass: process.env.DEV_EMAIL_PASSWORD,
      },
    };
  }

  // A transporter object is a service that sends the email
  createTransport() {
    return nodemailer.createTransport(this.constructor.getTransport());
  }

  // Function to read template content
  static getTemplate(template) {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', `views/${template}.handlebars`), 'utf-8');
    const handleBarInstance = handlebars.create();
    return handleBarInstance.handlebars.compile(source);
  }

  // Function to send an email
  async send(template, subject, url) {
    // 1.Get the required template content
    const templateContent = this.constructor.getTemplate(template);
    const compiledTemplate = templateContent({
      name: this.name,
      url,
      domain: `${this.req.protocol}://${this.req.get('host')}`,
    });

    // 2.Set required email options
    const emailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html: compiledTemplate,
      // text : "test"
    };

    // 3.Send the email
    await this.createTransport().sendMail(emailOptions);
  }

  // Function to set email templates
  async sendResetPassword(resetToken) {
    const resetLink = `${this.req.headers.origin}/resetPassword/${resetToken}`;
    await this.send('emails/resetPassword', 'Reset your NP Authentication app password', resetLink);
  }

  async sendResetPasswordConfirmation() {
    const loginLink = `${this.req.headers.origin}/login`;
    await this.send('emails/resetPasswordConfirmation', 'NP Authentication app password update confirmation', loginLink);
  }
}
