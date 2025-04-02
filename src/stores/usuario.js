// src/stores/usuario.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    user: null,
    rol: null,
    loading: false,
  }),

  getters: {
    autenticado: (state) => !!state.user,
    esAdmin: (state) => state.rol === 'admin',
  },

  actions: {
    async cargarUsuario() {
      this.loading = true
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        this.user = user
        const { data } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', user.id)
          .single()

        this.rol = data?.rol || null
      } else {
        this.user = null
        this.rol = null
      }

      this.loading = false
    },

    async login(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error) {
          await this.cargarUsuario()
        }
        return { error }
    },      

    async cerrarSesion() {
      await supabase.auth.signOut()
      this.user = null
      this.rol = null
    }
  }
})
