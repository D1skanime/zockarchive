<script setup lang="ts">
import { ZATag } from "@v2/lib";

defineProps<{ item: { destination: string; size: number; status: string } }>();
</script>
<template>
  <div class="download-queue-item">
    <span>{{ item.destination }}</span
    ><ZATag :text="item.status" />
  </div>
</template>
