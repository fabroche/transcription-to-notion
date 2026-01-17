import Joi from 'joi';

export const notebookQuerySchema = Joi.object({
  notebookTitle: Joi.string().min(1).max(200).required()
    .messages({
      'string.empty': 'Notebook title is required',
      'string.min': 'Notebook title must be at least 1 character',
      'string.max': 'Notebook title cannot exceed 200 characters',
      'any.required': 'Notebook title is required'
    }),
  prompt: Joi.string().min(10).max(1000).required()
    .messages({
      'string.empty': 'Prompt is required',
      'string.min': 'Prompt must be at least 10 characters',
      'string.max': 'Prompt cannot exceed 1000 characters',
      'any.required': 'Prompt is required'
    })
});
