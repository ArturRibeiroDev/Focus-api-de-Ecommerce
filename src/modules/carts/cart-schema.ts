import { z } from "zod"

export const addCartItemSchema = z.object({
    body: z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive()
    })
})

export const updateCartItemSchema = z.object({
    body: z.object({
        quantity: z.number().int().positive()
    })
})

const productIdParams = z.object({
  productId: z.number().int().positive(),
});

export const removeCartItemSchema = z.object({
  params: productIdParams,
});