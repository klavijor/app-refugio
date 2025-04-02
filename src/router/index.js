import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AnimalDetail from '../views/AnimalDetail.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'

import { supabase } from '../lib/supabase'

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
  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: async (to, from, next) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        next('/') // Redirige si ya está logeado
      } else {
        next()
      }
    }
  }  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Ruta protegida
router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAdmin) return next()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return next('/login')

  const { data, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (error || data?.rol !== 'admin') return next('/')

  next()
})

export default router
