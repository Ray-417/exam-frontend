<template>
  <div id="particles-container" ref="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const canvas = ref(null)
let ctx = null
let animationFrameId = null
let particles = []

const props = defineProps({
  color: {
    type: String,
    default: '#ffffff'
  },
  count: {
    type: Number,
    default: 80
  }
})

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 1
    this.vy = (Math.random() - 0.5) * 1
    this.size = Math.random() * 3 + 1
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy

    if (this.x < 0 || this.x > w) this.vx *= -1
    if (this.y < 0 || this.y > h) this.vy *= -1
  }

  draw(ctx, color) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }
}

const init = () => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resize()
  createParticles()
  animate()
  window.addEventListener('resize', resize)
}

const resize = () => {
  if (!canvas.value || !container.value) return
  canvas.value.width = container.value.offsetWidth
  canvas.value.height = container.value.offsetHeight
}

const createParticles = () => {
  particles = []
  const w = canvas.value.width
  const h = canvas.value.height
  for (let i = 0; i < props.count; i++) {
    particles.push(new Particle(w, h))
  }
}

const animate = () => {
  if (!canvas.value) return
  const w = canvas.value.width
  const h = canvas.value.height
  ctx.clearRect(0, 0, w, h)

  particles.forEach((p, index) => {
    p.update(w, h)
    p.draw(ctx, props.color)

    // Draw connections
    for (let j = index + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        ctx.beginPath()
        ctx.strokeStyle = props.color
        ctx.globalAlpha = 1 - distance / 100
        ctx.lineWidth = 0.5
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
  })

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
#particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>