<template>
  <div class="w-screen min-h-screen flex items-center justify-center p-2">
    <UCard class="container max-w-md mx-auto">
      <div class="space-y-4">
        <div class="items-center flex flex-col space-y-3">
          <AuthIcon />
          <span class="text-2xl font-bold">Welcome back!</span>
          <span class="text-muted">
            {{
              state === "code"
                ? "Enter the verification code sent to your email."
                : "Sign in to your account."
            }}
          </span>
        </div>
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-x-circle-solid"
          color="red"
          title="Error"
          :description="errorMessage"
        />
        <UAlert
          v-if="state === 'code'"
          icon="i-heroicons-check-circle-solid"
          color="lime"
          title="Code sent"
          :description="`Verification code was sent to: ${email}`"
        />
        <UForm
          class="w-full space-y-4"
          :schema="state === 'code' ? verifySchema : loginSchema"
          :state="data"
          :validate-on="['submit']"
          @submit="signIn($event)"
        >
          <input
            type="hidden"
            name="action"
            :value="
              state === 'code'
                ? 'verify'
                : data.password
                ? 'authorize'
                : 'request'
            "
          />

          <template v-if="state === 'code'">
            <UFormGroup label="Verification Code" name="code" required>
              <UInput
                v-model="data.code"
                placeholder="Enter verification code"
                inputmode="numeric"
                autocomplete="one-time-code"
              />
            </UFormGroup>
          </template>

          <template v-else>
            <UFormGroup label="Email" name="email" required>
              <UInput
                tabindex="1"
                v-model="data.email"
                placeholder="eg. john@example.com"
              />
            </UFormGroup>
            <UFormGroup label="Password" name="password">
              <UInput
                v-model="data.password"
                placeholder="leave empty to sign in with code"
                type="password"
                tabindex="2"
              />
              <template #hint>
                <UButton
                  @click="
                    navigateTo(`${origin}/password/change`, { external: true })
                  "
                  class="p-0"
                  variant="link"
                  >Forgot password?</UButton
                >
              </template>
            </UFormGroup>
          </template>

          <UButton
            tabindex="3"
            type="submit"
            color="black"
            block
            :loading="loading"
          >
            {{
              state === "code"
                ? "Verify Code"
                : data.password
                ? "Sign In"
                : "Send Code"
            }}
          </UButton>
        </UForm>

        <template v-if="state !== 'code'">
          <UDivider label="OR" />
          <AuthSocialLogin v-model="errorMessage" />
          <AuthAgreement />
        </template>
      </div>
      <template #footer>
        <div class="text-center">
          <template v-if="state === 'code'">
            <form :action="`${origin}/code/authorize`" method="POST">
              <input type="hidden" name="action" value="request" />
              <input type="hidden" name="email" :value="email" />
              <span
                >Didn't get the code?
                <UButton type="submit" variant="link" size="md" class="px-0"
                  >Resend.</UButton
                ></span
              >
            </form>
          </template>
          <template v-else>
            <span
              >Don't have an account?
              <UButton
                @click="
                  navigateTo(`${origin}/password/register`, { external: true })
                "
                variant="link"
                size="md"
                class="px-0"
                >Sign Up.</UButton
              >
            </span>
          </template>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type LoginError = "invalid_email" | "invalid_password" | "invalid_code" | null;

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

const verifySchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

const origin = import.meta.dev ? useRoute().query.origin?.toString() || "" : "";
const email = useRoute().query.email?.toString() || "";
const err = (useRoute().query.err?.toString() || null) as LoginError;
const state = useRoute().query.state?.toString() || "";

const data = reactive({
  email,
  password: "",
  code: "",
});

const loading = ref(false);

const ERROR_MESSAGES = {
  invalid_email: "Invalid email",
  invalid_password: "Invalid credentials",
  invalid_code: "Invalid verification code",
} as const;

const errorMessage = ref(
  err ? ERROR_MESSAGES[err] ?? "Something went wrong" : "",
);

const signIn = (e: Event) => {
  loading.value = true;
  const form = e.target as HTMLFormElement;
  const action =
    origin + (data.password ? "/password/authorize" : "/code/authorize");
  form.setAttribute("action", action);
  form.setAttribute("method", "POST");
  form.submit();
};
</script>
