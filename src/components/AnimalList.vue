<template>
    <div class="py-4 px-4 max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-center text-green-700 mb-10">
        🐾 Animales en Adopción
      </h1>
  
      <!-- Filtros -->
      <div class="flex flex-col md:flex-row md:items-center md:gap-6 mb-6">
        <div class="mb-4 md:mb-0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por especie:</label>
          <select v-model="filtroEspecie" class="border border-gray-300 rounded px-3 py-2 w-full">
            <option value="">Todas</option>
            <option v-for="especie in especiesDisponibles" :key="especie" :value="especie">
                {{ especie.charAt(0).toUpperCase() + especie.slice(1) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado:</label>
          <select v-model="filtroEstado" class="border border-gray-300 rounded px-3 py-2 w-full">
            <option value="">Todos</option>
            <option
                v-for="estado in estadosDisponibles"
                :key="estado"
                :value="estado"
            >
                {{ estado === 'en_adopcion' ? 'En adopción' : 'Adoptado' }}
            </option>
          </select>
        </div>
      </div>
  
      <!-- Mensajes de carga o vacío -->
      <div v-if="loading" class="text-center text-gray-500">Cargando animales...</div>
      <div v-else-if="animalesFiltrados.length === 0" class="text-center text-gray-500">No hay animales que coincidan con los filtros.</div>
  
      <!-- Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="animal in animalesFiltrados"
          :key="animal.id"
          :to="`/animal/${animal.id}`"
          class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200 flex flex-col group"
        >
          <img
            :src="animal.foto_url"
            :alt="animal.nombre"
            class="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div class="p-4">
            <h2 class="text-xl font-semibold text-green-700">{{ animal.nombre }}</h2>
            <p class="text-sm text-gray-600"><strong>Especie:</strong> {{ animal.especie }}</p>
            <p class="text-sm text-gray-600"><strong>Edad:</strong> {{ animal.edad_aprox }}</p>
            <p class="text-sm text-gray-600">
              <strong>Estado: </strong>
              <span
                :class="animal.estado === 'adoptado' ? 'text-red-500' : 'text-green-600'"
              >
                {{ animal.estado === 'adoptado' ? 'Adoptado' : 'En adopción' }}
              </span>
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

const animales = ref([])
const loading = ref(true)

const filtroEspecie = ref('')
const filtroEstado = ref('')
const especiesDisponibles = ref([])
const estadosDisponibles = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('animales')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al cargar animales:', error)
  } else {
    animales.value = data

    // extraer especies únicas
    const especies = [...new Set(data.map(a => a.especie).filter(Boolean))]
    especiesDisponibles.value = especies.sort()

    const estados = [...new Set(data.map(a => a.estado).filter(Boolean))]
    estadosDisponibles.value = estados.sort()
  }

  loading.value = false
})

const animalesFiltrados = computed(() => {
  return animales.value.filter((animal) => {
    const coincideEspecie = filtroEspecie.value === '' || animal.especie === filtroEspecie.value
    const coincideEstado = filtroEstado.value === '' || animal.estado === filtroEstado.value
    return coincideEspecie && coincideEstado
  })
})
  </script>
  