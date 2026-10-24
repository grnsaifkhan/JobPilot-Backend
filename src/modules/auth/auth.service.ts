import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./auth.repository.js";
import { QueryFailedError } from "typeorm";
import jwt, { type SignOptions } from 'jsonwebtoken';


interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
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


export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if(!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if(!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const secret = process.env.JWT_SECRET;

  if(!secret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }

  const expiresIn = (
    process.env.JWT_EXPIRES_IN || "15m"
  ) as SignOptions["expiresIn"];

  const accessToken = jwt.sign(
    { sub: user.id},
    secret,
    {expiresIn}
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  };
}