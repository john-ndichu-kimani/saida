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
const passport_facebook_1 = require("passport-facebook");
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
const user_interface_1 = require("../interfaces/user.interface");
dotenv_1.default.config();
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos'],
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const displayName = profile.displayName || '';
        const email = ((_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value) || '';
        const profileImage = ((_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value) || '';
        // Find user by Facebook ID
        let user = yield init_prisma_util_1.default.user.findUnique({
            where: { facebookId: profile.id },
        });
        if (!user) {
            // Check if user with the email already exists
            user = yield init_prisma_util_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                // If no user with the email exists, create a new one
                user = yield init_prisma_util_1.default.user.create({
                    data: {
                        facebookId: profile.id,
                        firstName: displayName,
                        lastName: '',
                        email,
                        profileImage,
                        phoneNumber: null, // Facebook doesn't provide phone number
                        password: '', // No password for OAuth users
                        role: user_interface_1.Role.CLIENT,
                        isVerified: true,
                        lastLogin: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                console.warn(`User with email ${email} already exists but has a different Facebook ID.`);
            }
        }
        else {
            // Update the last login time if user already exists
            user = yield init_prisma_util_1.default.user.update({
                where: { id: user.id },
                data: {
                    lastLogin: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        done(null, user);
    }
    catch (error) {
        console.error('Error during Facebook authentication:', error);
        done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield init_prisma_util_1.default.user.findUnique({ where: { id } });
        done(null, user || false);
    }
    catch (error) {
        console.error('Error during deserialization:', error);
        done(error);
    }
}));
