import Joi from 'joi';

const orderItemSchema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
});

const orderValidationSchema = Joi.object({
    userId: Joi.string().required(),
    orderItems: Joi.array().items(orderItemSchema).required(),
    totalAmount: Joi.number().min(0).required(),
    TotalStatus: Joi.number().min(0).required(),
    dateOrdered: Joi.date(),
});

export { orderValidationSchema };
