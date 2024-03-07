import Joi from 'joi';
import { UserDto } from '../dto/user.dto';

export const userSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  repeat_password: Joi.string().valid(Joi.ref("password")).messages({"any.only": "Repeat password and password don't match"}),
  phone_number: Joi.string().min(8)
});

export const validateUserUpdate = (user: UserDto): Joi.ValidationResult => {
  return userSchema.validate(user);
};
