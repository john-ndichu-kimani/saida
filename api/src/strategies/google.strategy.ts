import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import prisma from '../utils/init.prisma.util'; // Ensure this path is correct
import dotenv from 'dotenv';
import { Role } from '../interfaces/user.interface';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails?.[0].value || '',
            profileImage: profile.photos?.[0].value || '',
            password: '', // No password for OAuth users
            role: Role.CLIENT,
            isVerified: true,
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else {
        // Update the last login time
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});
