const nodemailer = require("nodemailer");
// whue vymq xynw iwbq
// walterkagwima2019@gmail.com
const sendVerificationEmail = (token, email, name) => {
  const html = `
    <html>
        <body>
            <h3>Dear ${name}</h3>
            <p>Thanks for signing up at GN Cyclemart!</p>
            <p>Use the link below to verify your email</p>
            <a href="http://localhost:5173/email-verify/${token}">Click here!</a>
        </body>
    </html>
    `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "walterkagwima2019@gmail.com",
      pass: "whue vymq xynw iwbq",
    },
  });

  const mailOptions = {
    from: "walterkagwima2019@gmail.com",
    to: email,
    subject: "Verify your email address",
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent to ${email}`);
      console.log(info.response);
    }
  });
};

module.exports = sendVerificationEmail;
