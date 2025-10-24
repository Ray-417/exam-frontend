<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { provide } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 提供全局消息方法
provide('showMessage', (message, type = 'success') => {
  ElMessage({
    message,
    type,
    duration: 2000
  })
})

// 提供全局确认框方法
provide('showConfirm', (message, title = '提示', type = 'warning') => {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type
  })
})
</script>

<style>
/* 全局样式已在style.css中定义 */
</style>
