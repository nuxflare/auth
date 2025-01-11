import {
  unknown,
  array,
  object,
  string,
  InferOutput,
  intersect,
} from "valibot";
import { createSubjects } from "@openauthjs/openauth/subject";

const baseUser = object({
  id: string(),
  email: string(),
  name: string(),
  image: string(),
});

const fullUser = intersect([
  baseUser,
  object({
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
]);

export const subjects = createSubjects({
  user: baseUser,
});

export type SubjectUser = InferOutput<typeof subjects.user>;

export type FullUser = InferOutput<typeof fullUser>;
