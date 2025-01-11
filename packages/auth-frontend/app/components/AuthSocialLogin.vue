<template>
  <div class="space-y-2">
    <UButton
      :loading="loading === 'github'"
      color="black"
      :label="`${signUp ? 'Sign Up' : 'Sign In'} with GitHub`"
      icon="i-simple-icons-github"
      block
      @click="signIn('github')"
    />
    <UButton
      :loading="loading === 'google'"
      color="black"
      :label="`${signUp ? 'Sign Up' : 'Sign In'} with Google`"
      icon="i-simple-icons-google"
      block
      @click="signIn('google')"
    />
  </div>
</template>

<script setup lang="ts">
const loading = ref<string>("");
const { signUp } = defineProps<{
  signUp?: boolean;
}>();

const origin = import.meta.dev ? useRoute().query.origin?.toString() || "" : "";
async function signIn(provider: string) {
  loading.value = provider;
  window.location.href = `${origin}/${provider}/authorize`;
}
</script>
