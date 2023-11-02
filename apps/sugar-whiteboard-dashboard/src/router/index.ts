import { createRouter, createWebHistory } from 'vue-router'
import ProjectView from '@/views/ProjectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'project',
      component: ProjectView
    }
  ]
})

export default router
