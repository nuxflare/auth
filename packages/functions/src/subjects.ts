import { unknown, array, object, string, InferOutput } from "valibot";
import { createSubjects } from "@openauthjs/openauth/subject";

export const subjects = createSubjects({
  user: object({
    id: string(),
    email: string(),
    name: string(),
    image: string(),
    createdAt: string(),
    updatedAt: string(),
    accounts: array(
      object({
        linkedAt: string(),
        type: string(),
        data: unknown(),
      }),
    ),
  }),
});

export type SubjectUser = InferOutput<typeof subjects.user>;
