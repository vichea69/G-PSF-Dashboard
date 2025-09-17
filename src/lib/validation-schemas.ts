import { z } from 'zod';
// validate email form
export const emailSchema = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' });

export type EmailSchema = z.infer<typeof emailSchema>;
// validate reset password form
export const resetPasswordSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Confirm password is required' })
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
// validate login form
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' })
});

export type LoginSchema = z.infer<typeof loginSchema>;
