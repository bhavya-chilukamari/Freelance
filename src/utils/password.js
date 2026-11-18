import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, hash) => {
  return await bcrypt.compare(plainPassword, hash);
};

