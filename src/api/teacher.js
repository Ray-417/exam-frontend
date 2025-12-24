import request from '@/utils/request'

// Question Bank
export function getQuestions(params) {
  return request({
    url: '/questions',
    method: 'get',
    params
  })
}

export function createQuestion(data) {
  return request({
    url: '/questions',
    method: 'post',
    data
  })
}

export function updateQuestion(id, data) {
  return request({
    url: `/questions/${id}`,
    method: 'put',
    data
  })
}

export function deleteQuestion(id) {
  return request({
    url: `/questions/${id}`,
    method: 'delete'
  })
}

export function importQuestions(data) {
  return request({
    url: '/questions/import',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function auditQuestion(id, data) {
  return request({
    url: `/questions/${id}/audit`,
    method: 'post',
    data
  })
}

// Paper Management
export function getPapers(params) {
  return request({
    url: '/papers',
    method: 'get',
    params
  })
}

export function createPaper(data) {
  return request({
    url: '/papers',
    method: 'post',
    data
  })
}

export function deletePaper(id) {
  return request({
    url: `/papers/${id}`,
    method: 'delete'
  })
}

// Exam Management
export function getExams(params) {
  return request({
    url: '/exams',
    method: 'get',
    params
  })
}

export function createExam(data) {
  return request({
    url: '/exams',
    method: 'post',
    data
  })
}

export function deleteExam(id) {
  return request({
    url: `/exams/${id}`,
    method: 'delete'
  })
}

export function getExamDetail(id) {
  return request({
    url: `/exams/${id}`,
    method: 'get'
  })
}

// Score Management
export function getScoreList(params) {
  return request({
    url: '/scores',
    method: 'get',
    params
  })
}

export function getExamStats(examId) {
  return request({
    url: '/scores/stats',
    method: 'get',
    params: { examId }
  })
}

export function adjustScore(id, data) {
  return request({
    url: `/scores/${id}`,
    method: 'put',
    data
  })
}

export function getStudentPaperDetail(examId, studentId) {
  return request({
    url: `/scores/${examId}/student/${studentId}`,
    method: 'get'
  })
}

export function submitGrading(examId, studentId, data) {
  return request({
    url: `/scores/${examId}/student/${studentId}`,
    method: 'post',
    data
  })
}

// Monitor
export function getMonitorData(examId) {
  return request({
    url: `/monitor/${examId}`,
    method: 'get'
  })
}

export function sendWarning(examId, data) {
  return request({
    url: `/monitor/${examId}/warning`,
    method: 'post',
    data
  })
}

export function forceSubmit(examId, data) {
  return request({
    url: `/monitor/${examId}/force-submit`,
    method: 'post',
    data
  })
}
