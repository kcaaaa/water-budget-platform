import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/conversation' },
  { 
    path: '/conversation', 
    component: () => import('../components/Conversation.vue'), 
    name: 'conversation' 
  },
  { 
    path: '/knowledge', 
    component: () => import('../components/KnowledgeBase.vue'), 
    name: 'knowledge' 
  },
  { 
    path: '/agent', 
    component: () => import('../components/AgentManagement.vue'), 
    name: 'agent' 
  },
  { 
    path: '/system', 
    component: () => import('../components/SystemManagement.vue'), 
    name: 'system' 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router