import Joi from 'joi';
import { UserDto } from '../dto/user.dto';

export const userSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  repeat_password: Joi.string().valid(Joi.ref("password")).messages({"any.only": "Repeat password and password don't match"}).required(),
  phone_number: Joi.string().min(8)
});

export const validateUser = (user: UserDto): Joi.ValidationResult => {
  return userSchema.validate(user);
};
