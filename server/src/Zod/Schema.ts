import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

export const userUpdateSchema = userSchema.partial();

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
});

export const productUpdateSchema = productSchema.partial();

export const reviewSchema = z.object({
  userId: z.string().cuid(),
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export const reviewUpdateSchema = reviewSchema.partial();

// export const tagSchema = z.object({
//   name: z.string().min(1),
// });

// export const tagUpdateSchema = tagSchema.partial();

export const reviewPhotoSchema = z.object({
  reviewId: z.string().cuid(),
  url: z.string().url(),
});

// export const reviewTagSchema = z.object({
//   reviewId: z.string().cuid(),
//   tagId: z.string().cuid(),
// });
