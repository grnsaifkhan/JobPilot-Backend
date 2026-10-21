import AppDataSource from "../../config/data-source.js";
import { User } from "../../entities/User.js";

const userRepository = AppDataSource.getRepository(User);


export function findUserByEmail(email: string): Promise<User | null> {
    return userRepository.findOne({
        where: {email}
    });
}


export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const user = userRepository.create(data);
  return userRepository.save(user);
}