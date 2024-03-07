import Joi from 'joi';
import { CreateTransferDto } from '../dto/transfer.dto';

export const transferSchema = Joi.object({
  source: Joi.string().required(),
  amount: Joi.number().required(),
  destination: Joi.string().required(),
  pin: Joi.string().required().messages({"any.only": "You must have a pin"}).min(4),
});

export const validateTransfer = (transfer: CreateTransferDto): Joi.ValidationResult => {
  return transferSchema.validate(transfer);
};