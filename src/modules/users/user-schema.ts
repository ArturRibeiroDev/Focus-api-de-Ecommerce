import { z } from "zod";

export const userSchema = z.object({
    body: z.object({
        id: z.string().trim().min(1)
    })
})