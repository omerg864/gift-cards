"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPublicId = exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const sendEmail = (receiver, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    var transporter = (0, nodemailer_1.createTransport)({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: receiver,
        subject: subject,
        text: text,
        html: html,
    };
    let success = false;
    yield transporter
        .sendMail(mailOptions)
        .then(() => {
        success = true;
    })
        .catch((err) => {
        console.log(err);
        success = false;
    });
    return success;
});
exports.sendEmail = sendEmail;
const extractPublicId = (url) => {
    // Remove the base URL and extract the part after /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
    }
    const parts = url.substring(uploadIndex + 8).split('/'); // +8 to skip "/upload/"
    const publicIdWithExtension = parts.slice(1).join('/'); // Skip the version part
    // Remove the file extension
    const dotIndex = publicIdWithExtension.lastIndexOf('.');
    const publicId = dotIndex !== -1
        ? publicIdWithExtension.substring(0, dotIndex)
        : publicIdWithExtension;
    return publicId;
};
exports.extractPublicId = extractPublicId;
