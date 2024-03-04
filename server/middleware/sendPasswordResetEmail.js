const nodemailer = require("nodemailer");
// whue vymq xynw iwbq
// walterkagwima2019@gmail.com
const sendPasswordResetEmail = (token, email, name) => {
  const html = `
    <html>
        <body>
          <h3>Dear ${name}</h3>
             <p>Please click on the link below to reset your password.</p>
             <a href="http://localhost:5173/password-reset/${token}">Click here!</a>
        </body>
    </html>`;

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
    subject: "GN Cyclemart: Reset your password request.",
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email send to ${email}`);
      console.log(info.response);
    }
  });
};

module.exports = sendPasswordResetEmail;
