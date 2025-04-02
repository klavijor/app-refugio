<template>
    <div class="max-w-2xl mx-auto px-4 py-4">
      <div v-if="loading" class="text-center text-gray-500">Cargando detalles...</div>
      <div v-else-if="!animal" class="text-center text-red-500">Animal no encontrado.</div>
      <div v-else class="bg-white shadow rounded-xl overflow-hidden">
        <img :src="animal.foto_url" :alt="animal.nombre" class="w-full h-80 object-cover" />
        <div class="p-6">
          <h1 class="text-3xl font-bold text-green-700 mb-2">{{ animal.nombre }}</h1>
          <ul class="text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>Especie:</strong> {{ animal.especie }}</li>
            <li><strong>Edad:</strong> {{ animal.edad_aprox }}</li>
            <li><strong>Sexo:</strong> {{ animal.sexo }}</li>
            <li><strong>Estado:</strong> {{ animal.estado }}</li>
            <li><strong>Fecha de rescate:</strong> {{ animal.fecha_rescate }}</li>
          </ul>
          <p class="text-gray-600 mb-4">{{ animal.historia }}</p>
  
          <a
            v-if="whatsappLink"
            :href="whatsappLink"
            target="_blank"
            class="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const route = useRoute()
const animal = ref(null)
const loading = ref(true)

const whatsappLink = computed(() => {
  if (!animal.value || !animal.value.contacto || animal.value.estado !== 'en_adopcion') return null
  const base = `https://wa.me/${animal.value.contacto}`
  const message = `Hola, quisiera adoptar a "${animal.value.nombre}", me podrías brindar más información.`
  return `${base}?text=${encodeURIComponent(message)}`
})

onMounted(async () => {
  const { data, error } = await supabase
    .from('animales')
    .select('*')
    .eq('id', route.params.id)
    .single()

  if (error) {
    console.error('Error al cargar detalles:', error)
  } else {
    animal.value = data
  }

  loading.value = false
})
  </script>
  