import * as bcrypt from "bcryptjs";

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

// Password comparison
export const comparePassword = async (enteredPassword: string, savedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(enteredPassword, savedPassword);
};