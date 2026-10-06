import { z } from "zod"

export const productSchema = z.object({
    body: z.object({
        name: z.string().min(3),
        description: z.string().min(1).optional(),
        price: z.number().positive(),
        stock: z.number().int().nonnegative().optional(),
        categoryId: z.number().int().positive().optional(),
    })
})