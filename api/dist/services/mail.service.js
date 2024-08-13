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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            const templatePath = path_1.default.resolve(__dirname, '../../src/templates', `${options.template}.ejs`);
            const templateContent = fs_1.default.readFileSync(templatePath, 'utf-8');
            const html = ejs_1.default.render(templateContent, options.context);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: options.to,
                subject: options.subject,
                html: html,
            };
            yield transporter.sendMail(mailOptions);
            console.log(`Email sent to ${options.to}: ${options.subject}`);
        }
        catch (error) {
            console.error(`Error sending email: ${error}`);
        }
    });
}
exports.default = sendEmail;
