import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./auth.repository.js";
import { QueryFailedError } from "typeorm";


interface RegisterInput {
    name: string;
    email: string;
    password: string;
}


export async function registerUser(input: RegisterInput) {

    const existingUser = await findUserByEmail(input.email);

    if(existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      return await createUser({
        name: input.name,
        email: input.email,
        passwordHash,
      });
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    
      throw error;
    }
}