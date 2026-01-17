import Joi from 'joi';

export const transcriptionSchema = Joi.object({
  driveFileId: Joi.string().required()
    .messages({
      'string.empty': 'Google Drive file ID is required',
      'any.required': 'Google Drive file ID is required'
    }),
  prompt: Joi.string().min(10).max(1000).required()
    .messages({
      'string.empty': 'Prompt is required',
      'string.min': 'Prompt must be at least 10 characters',
      'string.max': 'Prompt cannot exceed 1000 characters',
      'any.required': 'Prompt is required'
    })
});
