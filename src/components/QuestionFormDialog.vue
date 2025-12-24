<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="题型" prop="type">
        <el-select v-model="form.type" placeholder="请选择题型" style="width: 100%" @change="handleTypeChange">
          <el-option v-for="item in questionTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="难度" prop="difficulty">
        <el-rate v-model="form.difficulty" />
      </el-form-item>
      
      <el-form-item label="题目内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入题目描述" />
      </el-form-item>
      
      <!-- Options for Choice Questions -->
      <div v-if="['single_choice', 'multiple_choice'].includes(form.type)">
        <el-divider content-position="left">选项设置</el-divider>
        <div v-for="(option, index) in form.options" :key="index" class="option-item">
          <el-input v-model="option.key" style="width: 60px" placeholder="选项" />
          <el-input v-model="option.value" style="flex: 1; margin: 0 10px" placeholder="选项内容" />
          <el-button type="danger" circle icon="Delete" size="small" @click="removeOption(index)" />
        </div>
        <el-button type="primary" link icon="Plus" @click="addOption" style="margin-top: 10px">添加选项</el-button>
      </div>

      <el-form-item label="正确答案" prop="answer" style="margin-top: 20px">
        <el-input v-model="form.answer" type="textarea" :rows="2" placeholder="请输入正确答案" />
      </el-form-item>
      
      <el-form-item label="解析" prop="analysis">
        <el-input v-model="form.analysis" type="textarea" :rows="2" placeholder="请输入答案解析" />
      </el-form-item>
      
      <el-form-item label="知识点">
        <el-select
          v-model="form.knowledgePoints"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请选择或输入知识点"
          style="width: 100%"
        >
          <el-option
            v-for="item in knowledgePointOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: 'add' // 'add' or 'edit'
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  submitting: Boolean
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref(null)
const form = reactive({
  id: null,
  type: 'single_choice',
  difficulty: 3,
  content: '',
  options: [{ key: 'A', value: '' }, { key: 'B', value: '' }, { key: 'C', value: '' }, { key: 'D', value: '' }],
  answer: '',
  analysis: '',
  knowledgePoints: []
})

const title = computed(() => props.mode === 'add' ? '添加题目' : '编辑题目')

const questionTypes = [
  { label: '单选题', value: 'single_choice' },
  { label: '多选题', value: 'multiple_choice' },
  { label: '判断题', value: 'true_false' },
  { label: '填空题', value: 'fill_blank' },
  { label: '简答题', value: 'short_answer' },
  { label: '编程题', value: 'programming' }
]

const knowledgePointOptions = [
  { value: 'Java基础', label: 'Java基础' },
  { value: '面向对象', label: '面向对象' },
  { value: '集合框架', label: '集合框架' },
  { value: '多线程', label: '多线程' },
  { value: 'JVM', label: 'JVM' }
]

const rules = {
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
}

// Watch for visible change to reset or fill form
watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'edit' && props.initialData && Object.keys(props.initialData).length > 0) {
      // Deep copy to avoid reference issues
      Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
    } else {
      // Reset
      resetForm()
    }
  }
})

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.id = null
  form.type = 'single_choice'
  form.difficulty = 3
  form.content = ''
  form.options = [{ key: 'A', value: '' }, { key: 'B', value: '' }, { key: 'C', value: '' }, { key: 'D', value: '' }]
  form.answer = ''
  form.analysis = ''
  form.knowledgePoints = []
}

const addOption = () => {
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const nextKey = keys[form.options.length] || '?'
  form.options.push({ key: nextKey, value: '' })
}

const removeOption = (index) => {
  form.options.splice(index, 1)
}

const handleTypeChange = () => {
  // Optional: logic when type changes
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
    }
  })
}
</script>

<style scoped>
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
