import authRepository from "../repositories/auth.repository.js";
import AppError from "../utils/error.js";

const postAuth = async (userId, name, avatar, email) => {
  try {
    const user = await authRepository.getUserByID(userId);

    if (user) {
      return user;
    }

    return await authRepository.postAuth(userId, name, avatar, email);
  } catch (error) {
    throw new AppError(error.message);
  }
};

const patchAuth = async (
  id,
  avatar,
  email,
  name,
  userId,
  experience,
  goal,
  height,
  publicProfile,
  weight
) => {
  try {
    return await authRepository.patchAuth(
      id,
      avatar,
      email,
      name,
      userId,
      experience,
      goal,
      height,
      publicProfile,
      weight
    );
  } catch (error) {
    throw new AppError(error.message);
  }
};

export default {
  postAuth,
  patchAuth,
};
