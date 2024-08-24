<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Box from '@/components/layout/Box.vue';
import Item from '@/components/layout/Item.vue';
</script>

<template>
  <Box direction="horizon">
    <Item
      width="100"
      style="border: 1px solid green;"
    >
      123
    </Item>
    <Item>456</Item>
  </Box>
</template>

<style scoped>


</style>
