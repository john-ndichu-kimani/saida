import joi from 'joi';

export const registerSchema = joi.object({
  username: joi.string().min(2).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 2 characters long',
  }),
  email: joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  password_hash: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).required().messages({
    'string.empty': 'Password is required',
    'string.pattern.base': 'Password must be at least 8 characters long and contain letters and numbers',
  }),
  
  first_name: joi.string().min(2).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters long',
  }),
  last_name: joi.string().min(2).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters long',
  }),
  phone_number: joi.string().regex(/^[0-9]{10}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Phone number must be exactly 10 digits',
  }),
  profile_picture_url: joi.string().uri().optional().messages({
    'string.uri': 'Profile picture URL must be a valid URI',
  }),
});

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  password_hash: joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});
