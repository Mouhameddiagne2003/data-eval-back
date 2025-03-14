import Joi from "joi";

export const registerValidation = Joi.object({
  nom: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(6).required(),
  role: Joi.string().valid("Etudiant", "Enseignant").required()
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  motDePasse: Joi.string().required()
});
