import { z } from "zod"

export const addCartItemSchema = z.object({
    body: z.object({
        productId: z.coerce.number().int().positive().max(2_147_483_647),
        quantity: z.number().int().positive().max(2_147_483_647)
    })
})

const productIdParams = z.object({
    productId: z.coerce.number().int().positive().max(2_147_483_647),
});

export const updateCartItemSchema = z.object({
  params: productIdParams,
  body: z.object({
    quantity: z.number().int().positive().max(2_147_483_647),
  }),
});

export const removeCartItemSchema = z.object({
  params: productIdParams,
});
