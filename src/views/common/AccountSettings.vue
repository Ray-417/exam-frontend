<template>
  <div class="page-container">
    <h2>账号设置</h2>
    <el-card>
      <el-tabs>
         <el-tab-pane label="修改密码">
            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px" style="max-width: 500px">
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input v-model="pwdForm.oldPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="pwdForm.newPassword" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitPwdForm">确认修改</el-button>
                </el-form-item>
            </el-form>
         </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const pwdFormRef = ref(null)
const pwdForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const pwdRules = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
    confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
}

const submitPwdForm = async () => {
    if (!pwdFormRef.value) return
    await pwdFormRef.value.validate((valid) => {
        if (valid) {
            // Mock API
            ElMessage.success('密码修改成功，请重新登录')
            // localStorage.removeItem('token')
            // router.push('/login')
        }
    })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
