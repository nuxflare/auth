<template>
  <div class="w-screen min-h-screen flex items-center justify-center p-2">
    <UCard class="container max-w-md mx-auto">
      <div class="space-y-4">
        <div class="items-center flex flex-col space-y-3">
          <AuthIcon />
          <span class="text-2xl font-bold">Sign Up</span>
          <span class="text-muted">{{
            state === "code"
              ? "Enter the verification code sent to your email."
              : "Create an account now."
          }}</span>
        </div>
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-x-circle-solid"
          color="red"
          title="Error"
          :description="errorMessage"
        />
        <UAlert
          v-else-if="confirmUser"
          icon="i-heroicons-check-circle-solid"
          color="lime"
          title="Confirmation sent"
          :description="`Confirmation email was sent to: ${confirmUser}. Check your email to finish sign up!`"
        />
        <UForm
          class="w-full space-y-4"
          :schema="state === 'code' ? verifySchema : registerSchema"
          :state="data"
          :validate-on="['submit']"
          @submit="signUp($event)"
        >
          <input
            type="hidden"
            name="action"
            :value="state === 'code' ? 'verify' : 'register'"
          />

          <template v-if="state === 'code'">
            <UFormGroup label="Verification Code" name="code" required>
              <UInput
                v-model="data.code"
                placeholder="Enter verification code"
              />
            </UFormGroup>
          </template>

          <template v-else>
            <UFormGroup label="Email" name="email" required>
              <UInput v-model="data.email" placeholder="eg. john@example.com" />
            </UFormGroup>
            <UFormGroup label="Password" name="password" required>
              <UInput
                v-model="data.password"
                placeholder="**************"
                type="password"
              />
            </UFormGroup>
            <UFormGroup label="Confirm Password" name="repeat" required>
              <UInput
                v-model="data.repeat"
                placeholder="**************"
                type="password"
              />
            </UFormGroup>
          </template>

          <UButton :loading="loading" color="black" block type="submit">
            {{ state === "code" ? "Verify Email" : "Sign Up" }}
          </UButton>
        </UForm>

        <template v-if="state !== 'code'">
          <UDivider label="OR" />
          <AuthSocialLogin v-model="errorMessage" :sign-up="true" />
        </template>
        <AuthAgreement />
      </div>
      <template #footer>
        <div class="text-center">
          <!-- <template v-if="state === 'code'"> -->
          <!--   <form :action="`${origin}/password/register`" method="POST"> -->
          <!--     <input type="hidden" name="action" value="register" /> -->
          <!--     <input type="hidden" name="email" :value="email" /> -->
          <!--     <span -->
          <!--       >Didn't get the code? -->
          <!--       <UButton type="submit" variant="link" size="md" class="px-0" -->
          <!--         >Resend.</UButton -->
          <!--       ></span -->
          <!--     > -->
          <!--   </form> -->
          <!-- </template> -->
          <template v-if="true">
            <span
              >Already have an account?
              <UButton
                @click="
                  navigateTo(`${origin}/password/authorize`, { external: true })
                "
                variant="link"
                size="md"
                class="px-0"
                >Login.</UButton
              >
            </span>
          </template>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type SignupError =
  | "invalid_email"
  | "invalid_code"
  | "email_taken"
  | "invalid_password"
  | null;

import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8),
    repeat: z.string().min(8),
  })
  .refine((data) => data.password === data.repeat, {
    message: "Passwords don't match",
    path: ["repeat"],
  });

const verifySchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

const data = reactive({
  email: "",
  password: "",
  repeat: "",
  code: "",
});
const loading = ref(false);
const origin = import.meta.dev ? useRoute().query.origin?.toString() || "" : "";
const state = useRoute().query.state?.toString();
const confirmUser = ref<string | null>(null);
// const email = useRoute().query.email?.toString() || "";
const err = (useRoute().query.err?.toString() || null) as SignupError;

const ERROR_MESSAGES = {
  invalid_email: "Invalid email",
  invalid_code: "Invalid verification code",
  email_taken: "This email is already taken",
  invalid_password: "Invalid password",
} as const;

const errorMessage = ref(
  err ? ERROR_MESSAGES[err] ?? "Something went wrong" : "",
);

const signUp = (e: Event) => {
  loading.value = true;
  const form = e.target as HTMLFormElement;
  const action = origin + "/password/register";
  form.setAttribute("action", action);
  form.setAttribute("method", "POST");
  form.submit();
};
</script>
