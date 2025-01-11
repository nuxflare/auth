<template>
  <div class="py-2">
    <UContainer>
      <UCard>
        <template #header>
          <div class="flex w-full justify-between">
            <div class="flex items-center gap-4">
              <UAvatar
                :alt="user?.name || user?.email"
                :src="user?.image || undefined"
                size="xl"
              />
              <div class="flex flex-col">
                <span class="text-xl font-semibold">{{ user?.name }}</span>
                <span class="text-gray-500">{{ user?.email }}</span>
              </div>
            </div>
            <div>
              <UButton @click="logout" label="Logout" />
            </div>
          </div>
        </template>
        <div class="space-y-4">
          <div class="space-x-2">
            <span class="font-medium">Welcome back!</span>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
const { user, clear } = useSession();
function logout() {
  clear();
  navigateTo("/", { external: true });
}
</script>
