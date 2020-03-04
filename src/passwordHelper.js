import crypto from 'crypto';

export const generateSalt = () => crypto.randomBytes(16).toString('hex');

export const generateHash = (password, salt) => crypto.createHash('sha256').update(password + salt).digest('hex');

export const comparePassword = (password, salt, hashedPassword) => crypto.createHash('sha256').update(password + salt).digest('hex') === hashedPassword;
