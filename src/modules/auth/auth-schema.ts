import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3, "O nome precisa ter pelo menos 3 carácteres."),
        email: z.string().email("E-mail inválido."),
        password: z
            .string()
            .min(8, "A senha tem que ter pelo menos 8 carácteres."),
    }),
});
