import Joi from 'joi';
import { UserDto } from '../dto/user.dto';

export const userSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().min(8),
  pin: Joi.string().required().messages({"any.only": "You must have a pin"}).min(4),
});

export const validateUser = (user: UserDto): Joi.ValidationResult => {
  return userSchema.validate(user);
};
