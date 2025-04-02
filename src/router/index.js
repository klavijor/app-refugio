import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AnimalDetail from '../views/AnimalDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/animal/:id',
    name: 'AnimalDetail',
    component: AnimalDetail,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
