import { Strategy as FacebookStrategy } from 'passport-facebook';
import passport from 'passport';
import dotenv from 'dotenv';
import prisma from '../utils/init.prisma.util';
import { Role } from '../interfaces/user.interface';

dotenv.config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails', 'photos'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const displayName = profile.displayName || '';
        
      

        const email = profile.emails?.[0].value || '';
        const profileImage = profile.photos?.[0].value || '';

        // Find user by Facebook ID
        let user = await prisma.user.findUnique({
          where: { facebookId: profile.id },
        });

        if (!user) {
          // Check if user with the email already exists
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // If no user with the email exists, create a new one
            user = await prisma.user.create({
              data: {
                facebookId: profile.id,
                firstName:displayName ,
                lastName:'',
                email,
                profileImage,
                phoneNumber: null, // Facebook doesn't provide phone number
                password: '', // No password for OAuth users
                role: Role.CLIENT,
                isVerified: true,
                lastLogin: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          } else {
            console.warn(`User with email ${email} already exists but has a different Facebook ID.`);
          }
        } else {
          // Update the last login time if user already exists
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
        console.error('Error during Facebook authentication:', error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (error) {
    console.error('Error during deserialization:', error);
    done(error);
  }
});
