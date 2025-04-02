<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 class="text-2xl font-bold mb-4 text-center text-green-700">Iniciar sesión</h1>
        <form @submit.prevent="login">
          <input v-model="email" type="email" placeholder="Correo" class="input mb-3" required />
          <input v-model="password" type="password" placeholder="Contraseña" class="input mb-4" required />
          <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
            Iniciar sesión
          </button>
          <p v-if="error" class="text-red-600 mt-3 text-sm text-center">{{ error }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../lib/supabase'
  
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const router = useRouter()
  
  const login = async () => {
    error.value = ''
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  
    if (authError) {
      error.value = authError.message
      return
    }
  
    // redirige a admin (router guard lo verificará)
    router.replace('/admin')
  }
  </script>
  
  <style scoped>
  .input {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.5rem;
    width: 100%;
  }
  </style>
  