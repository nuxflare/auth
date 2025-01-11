<template>
  <div>
    <NuxtLoadingIndicator :color="false" class="z-100 bg-primary/80" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>
