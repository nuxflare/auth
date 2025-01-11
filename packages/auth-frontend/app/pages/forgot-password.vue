<template>
  <div class="w-screen min-h-screen flex items-center justify-center p-2">
    <UCard class="container max-w-md mx-auto">
      <div class="space-y-4">
        <div class="items-center flex flex-col space-y-3">
          <AuthIcon />
          <span class="text-2xl font-bold">Forgot Password</span>
          <span class="text-muted">{{
            state === "code"
              ? "Enter the verification code sent to your email."
              : state === "update"
              ? "Enter your new password."
              : "Enter your email to reset your password."
          }}</span>
        </div>

        <UAlert
          v-if="successMessage"
          icon="i-heroicons-check-circle-solid"
          color="green"
          title="Success"
          :description="successMessage"
        />

        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-x-circle-solid"
          color="red"
          title="Error"
          :description="errorMessage"
        />

        <UForm
          class="w-full space-y-4"
          :schema="formSchema"
          :state="data"
          :validate-on="['submit']"
          @submit="handleSubmit"
        >
          <input
            type="hidden"
            name="action"
            :value="
              state === 'code'
                ? 'verify'
                : state === 'update'
                ? 'update'
                : 'code'
            "
          />

          <template v-if="state === 'start'">
            <UFormGroup label="Email" name="email" required>
              <UInput v-model="data.email" placeholder="eg. john@example.com" />
            </UFormGroup>
          </template>

          <template v-if="state === 'code'">
            <UFormGroup label="Verification Code" name="code" required>
              <UInput
                v-model="data.code"
                placeholder="Enter verification code"
                autocomplete="one-time-code"
              />
            </UFormGroup>
          </template>

          <template v-if="state === 'update'">
            <UFormGroup label="New Password" name="password" required>
              <UInput
                v-model="data.password"
                type="password"
                placeholder="**************"
                autocomplete="new-password"
              />
            </UFormGroup>
            <UFormGroup label="Confirm Password" name="repeat" required>
              <UInput
                v-model="data.repeat"
                type="password"
                placeholder="**************"
                autocomplete="new-password"
              />
            </UFormGroup>
          </template>

          <UButton :loading="loading" color="black" block type="submit">
            {{
              state === "code"
                ? "Verify Code"
                : state === "update"
                ? "Update Password"
                : "Send Code"
            }}
          </UButton>
        </UForm>

        <template v-if="state === 'code'">
          <form :action="`${origin}/password/change`" method="POST">
            <input type="hidden" name="action" value="code" />
            <input type="hidden" name="email" :value="data.email" />
            <div class="text-center space-x-1">
              <span>Didn't get the code?</span>
              <UButton type="submit" variant="link" size="md" class="px-0">
                Resend.
              </UButton>
            </div>
          </form>
        </template>
      </div>
      <template #footer>
        <div class="text-center">
          <span>Remember your password? </span>
          <UButton
            @click="
              navigateTo(`${origin}/password/authorize`, { external: true })
            "
            variant="link"
            size="md"
            class="px-0"
            >Login.</UButton
          >
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

type ForgotError =
  | "invalid_email"
  | "invalid_code"
  | "invalid_password"
  | "password_mismatch"
  | null;

const state = (useRoute().query.state?.toString() || "start") as
  | "start"
  | "code"
  | "update";

const startSchema = z.object({
  email: z.string().email("Invalid email"),
});

const codeSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

const updateSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeat: z.string(),
  })
  .refine((data) => data.password === data.repeat, {
    message: "Passwords don't match",
    path: ["repeat"],
  });

const formSchema = computed(() => {
  switch (state) {
    case "code":
      return codeSchema;
    case "update":
      return updateSchema;
    default:
      return startSchema;
  }
});

const email = useRoute().query.email?.toString() || "";
const data = reactive({
  email,
  code: "",
  password: "",
  repeat: "",
});

const origin = import.meta.dev ? useRoute().query.origin?.toString() || "" : "";
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const ERROR_MESSAGES = {
  invalid_email: "Invalid email address",
  invalid_code: "Invalid verification code",
  invalid_password: "Password must be at least 8 characters",
  password_mismatch: "Passwords don't match",
} as const;

const err = (useRoute().query.err?.toString() || null) as ForgotError;
if (err) {
  errorMessage.value = ERROR_MESSAGES[err] ?? "Something went wrong";
}

const handleSubmit = (e: Event) => {
  loading.value = true;
  const form = e.target as HTMLFormElement;
  const action = origin + "/password/change";
  form.setAttribute("action", action);
  form.setAttribute("method", "POST");
  form.submit();
};
</script>
