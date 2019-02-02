const express = require("express");
const config = require("config");
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const pdf = require("html-pdf");

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: config.get("host"),
  port: 465,
  secure: true,
  auth: {
    user: config.get("username"),
    pass: config.get("password")
  }
});

router.post("/api/mail", (req, res) => {
  ejs.renderFile(
    "public/sample-template.ejs",
    {
      name: req.body.name
    },
    (err, html) => {
      if (err) console.log("Oops! HTML cannot be rendered at the moment.", err);
      else {
        // console.log("HTML rendered.");
        res.status(200).send("Mail sent.");
        pdf.create(html).toStream((err, stream) => {
          if (err)
            console.log("Oops! PDF cannot be created at the moment.", err);
          else {
            stream.pipe(fs.createWriteStream("public/foo.pdf"));
            // console.log("Mail sent.");
          }
        });
        transporter.sendMail(
          {
            from: `"Test Mailer Bot" <${config.get("username")}>`,
            to: req.body.email,
            subject: "PDF attachment test mail",
            text: "Testing dynamic PDF attachment",
            attachments: [
              {
                filename: "Sample File.pdf",
                path: "public/foo.pdf"
              }
            ]
          },
          (err, success) => {
            if (err)
              console.log("Oops! Mail cannot be sent at the moment.", err);
            else console.log("Mail sent.");
          }
        );
      }
    }
  );
});

module.exports = router;
