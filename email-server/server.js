require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Nodemailer with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Email server error:", error);
  } else {
    console.log("Server is ready to take our messages!");
  }
}); 

app.post('/send-email', (req, res) => {
  const { toEmail, userName, serviceType, date, time, status, reason } = req.body;

  let subject = '';
  let htmlContent = '';

  if (status === 'Accepted') {
    subject = `Your Crystal Clear Booking is Confirmed!`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0d9488;">Booking Confirmed</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your <strong>${serviceType}</strong> appointment on <strong>${date} at ${time}</strong> has been accepted by our team.</p>
        <p>Our team will arrive on schedule to provide you with the best cleaning service.</p>
        <br/>
        <p>Thank you for choosing Crystal Clear!</p>
      </div>
    `;
  } else if (status === 'Rejected' || status === 'Cancelled') {
    subject = `Update on your Crystal Clear Booking`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #ef4444;">Booking ${status}</h2>
        <p>Hi ${userName},</p>
        <p>We are writing to inform you that your <strong>${serviceType}</strong> appointment on <strong>${date} at ${time}</strong> has been ${status.toLowerCase()}.</p>
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; color: #b91c1c;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>We apologize for any inconvenience. Please feel free to book another time slot.</p>
        <br/>
        <p>Thank you,<br/>Crystal Clear Team</p>
      </div>
    `;
  } else {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const mailOptions = {
    from: `"Crystal Clear" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(500).json({ error: error.toString() });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});
