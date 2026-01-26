import * as bcrypt from "bcryptjs";

// Optimized password hashing with appropriate salt rounds
export const hashPassword = async (password: string): Promise<string> => {
    // Use 10 rounds for better performance while maintaining security
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Password comparison - no changes needed as bcrypt.compare is already optimized
export const comparePassword = async (enteredPassword: string, savedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(enteredPassword, savedPassword);
};