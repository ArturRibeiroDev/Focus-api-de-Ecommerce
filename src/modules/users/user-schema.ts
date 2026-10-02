import { z } from "zod";

const userSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export { userSchema };
