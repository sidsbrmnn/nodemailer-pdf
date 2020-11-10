const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');
require('express-async-errors');
const fs = require('fs');
const Handlebars = require('handlebars');
const pdf = require('html-pdf');
const Joi = require('joi');
const path = require('path');
const nodemailer = require('nodemailer');

process.on('uncaughtException', (error) => {
    console.log('Uncaught exception', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at', promise, 'Reason', reason);
    process.exit(1);
});

dotenv.config();

const {
    TRANSPORT_HOST,
    TRANSPORT_PORT,
    TRANSPORT_USER,
    TRANSPORT_PASS,
} = process.env;
if (!TRANSPORT_HOST || !TRANSPORT_PORT || !TRANSPORT_USER || !TRANSPORT_PASS) {
    throw new Error('transport account not set');
}

const filePath = path.join(__dirname, 'templates', 'mail.hbs');
const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
const template = Handlebars.compile(fileContents);

const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
});

const transport = nodemailer.createTransport({
    host: TRANSPORT_HOST,
    port: parseInt(TRANSPORT_PORT, 10),
    secure: parseInt(TRANSPORT_PORT, 10) === 465,
    auth: {
        user: TRANSPORT_USER,
        pass: TRANSPORT_PASS,
    },
});

function createPdfBuffer(data) {
    return new Promise((resolve, reject) => {
        pdf.create(template(data)).toBuffer((err, buffer) => {
            if (err) {
                return reject(err);
            }

            return resolve(buffer);
        });
    });
}

const app = express();

app.use(bodyParser.json());

app.post('/', async (req, res) => {
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const buffer = await createPdfBuffer({ name: value.name });

    await transport.sendMail({
        from: '"Foo Bar 👻" <' + TRANSPORT_USER + '>',
        to: value.email,
        subject: 'Hello ✔',
        text: `Hi, ${value.name}.\nCheck the attachment.`,
        html: `<p>Hi, ${value.name}.<br/>Check the attachment.</p>`,
        attachments: [{ filename: 'Welcome.pdf', content: buffer }],
    });

    res.json({ success: true });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.log(err);

    res.status(500).json({ message: err.message || 'Something went wrong.' });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
    console.log(`Listening on port :${PORT}`);
});
