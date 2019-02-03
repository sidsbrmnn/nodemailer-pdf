const express = require("express");
const nodemailer = require("nodemailer");
const config = require("config");
const fs = require("fs");
const ejs = require("ejs");
const pdf = require("html-pdf");
const validate = require("../models/validate");

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

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let html = await ejs.renderFile("public/sample-template.ejs", {
    name: req.body.name
  });
  pdf.create(html).toFile("public/foo.pdf", (err, filepath) => {
    if (err) throw err;
  });

  await transporter.sendMail({
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
  });

  res.status(200).send("Mail sent.");
});

module.exports = router;
