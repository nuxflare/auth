<template>
  <div
    class="h-screen w-screen flex flex-col gap-2 items-center justify-center"
  >
    <UIcon
      class="text-blue-500 dark:text-blue-400 w-6 h-6 animate-spin"
      name="i-heroicons-arrow-path-20-solid"
    />
  </div>
</template>

<script setup lang="ts">
const { client, callback, setTokens, redirect } = useAuth();
const code = useRoute().query.code?.toString() || "";
onMounted(async () => {
  const redirectUrl = redirect.value;
  try {
    const tokens = await client.exchange(code, callback);
    if (!tokens.err) {
      setTokens(tokens.tokens.access, tokens.tokens.refresh);
      redirect.value = null;
    }
  } catch {}
  navigateTo(redirectUrl || "/");
});
</script>
