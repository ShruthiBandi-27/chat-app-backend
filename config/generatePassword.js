import bcrypt from 'bcrypt';

export const generatePassword =  async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`hashedPass: ${hashedPassword}`);
    return hashedPassword;
}