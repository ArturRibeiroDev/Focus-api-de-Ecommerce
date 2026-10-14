import { z } from "zod"

export const productSchema = z.object({
    body: z.object({
        name: z.string().min(3),
        description: z.string().min(1).optional(),
        price: z.number().gte(0),
        stock: z.number().int().nonnegative().optional(),
        categoryId: z.number().int().positive(),
    })
})

export const productUpdateSchema = z.object({
    body: productSchema.shape.body
        .partial()
})


export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  search: z.string().trim().max(100).optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
