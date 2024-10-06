import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  context:any;
}

async function sendEmail(options: SendEmailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const templatePath = path.resolve(__dirname, '../../src/templates', `${options.template}.ejs`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(templateContent, options.context);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
}

export default sendEmail;
