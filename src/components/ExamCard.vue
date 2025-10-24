<template>
  <el-card shadow="hover" class="rounded-xl cursor-pointer" @click="$emit('start', exam)">
    <h3 class="text-lg font-semibold mb-1">{{ exam.title }}</h3>
    <p class="text-gray-500 text-sm">时间：{{ exam.time }}</p>
  </el-card>
</template>

<script setup>
defineProps({ exam: Object })
</script>
