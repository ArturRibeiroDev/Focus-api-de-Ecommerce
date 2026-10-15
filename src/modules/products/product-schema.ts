import { z } from "zod"

const postgresInt = z.number().int().min(0).max(2_147_483_647);
const productPrice = z.number().finite().min(0).max(99_999_999.99)
    .refine((value) => Number(value.toFixed(2)) === value, "O preço aceita no máximo duas casas decimais.");

export const productSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1),
        description: z.string().trim(),
        price: productPrice,
        stock: postgresInt.optional(),
        categoryId: z.number().int().positive().max(2_147_483_647),
    })
})

export const productUpdateSchema = z.object({
    body: productSchema.shape.body
        .partial()
        .refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo para atualizar.")
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

export const productIdSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive().max(2_147_483_647) }),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
