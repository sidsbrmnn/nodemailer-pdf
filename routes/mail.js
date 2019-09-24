const ejs = require("ejs");
const express = require("express");
const fs = require("fs");
const pdf = require("html-pdf");
const nodemailer = require("nodemailer");

const validate = require("../models/validate");

const router = express.Router();

const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});

const createPdf = (html, filepath) => {
  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(filepath, (err, res) => {
      if (err) reject(err);

      resolve(res);
    });
  });
};

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const html = await ejs.renderFile("public/sample-template.ejs", {
    name: req.body.name
  });

  const filepath = "public/foo.pdf";

  await createPdf(html, filepath);

  await transporter.sendMail({
    from: `"Test Mailer Bot" <${MAIL_USER}>`,
    to: req.body.email,
    subject: "PDF attachment test mail",
    text: "Testing dynamic PDF attachment",
    attachments: [
      {
        filename: "Sample File.pdf",
        path: filepath
      }
    ]
  });

  res.status(200).send("Mail sent.");
});

module.exports = router;
