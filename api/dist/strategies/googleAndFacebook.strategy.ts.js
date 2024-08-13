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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
const user_interface_1 = require("../interfaces/user.interface"); // Adjust path as needed
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let user = yield init_prisma_util_1.default.user.findUnique({
            where: { googleId: profile.id },
        });
        if (!user) {
            user = yield init_prisma_util_1.default.user.create({
                data: {
                    googleId: profile.id,
                    firstName: ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || '',
                    lastName: ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName) || '',
                    email: ((_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0].value) || '',
                    profileImage: ((_d = profile.photos) === null || _d === void 0 ? void 0 : _d[0].value) || '',
                    password: '', // No password for OAuth users
                    role: user_interface_1.Role.CLIENT,
                    isVerified: true, // Google users are assumed to be verified
                    lastLogin: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
        }
        else {
            // Update the last login time
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
        done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield init_prisma_util_1.default.user.findUnique({
            where: { id },
        });
        if (user) {
            done(null, user);
        }
        else {
            done(null, false); // Handle case where user is not found
        }
    }
    catch (error) {
        done(error);
    }
}));
exports.default = passport_1.default;
