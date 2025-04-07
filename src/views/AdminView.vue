<template>
    <div class="max-w-7xl mx-auto px-4 py-4">
        <router-link
        to="/"
        class="mb-4 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
        ← Volver al inicio
        </router-link>

      <h1 class="text-2xl sm:text-3xl font-bold text-green-700 mb-6 break-words text-center">📋 Panel de Administración</h1>

      <!-- Botón -->
      <button
        @click="abrirModalAgregar"
        class="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
      >
        Agregar nuevo animal
      </button>
  
      <!-- Modal usando Headless UI -->
      <Dialog :open="mostrarFormulario" @close="cerrarModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogOverlay class="fixed inset-0 bg-black bg-opacity-40" />
        
        <!-- Contenedor con scroll si es necesario -->
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative max-h-screen overflow-y-auto">
          <button @click="cerrarModal" class="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl">
            ✖
          </button>
          
          <DialogTitle class="text-xl font-semibold text-green-700 mb-4">
            {{ modoFormulario === 'editar' ? 'Editar animal 📝' : 'Nuevo animal 🐶' }}
          </DialogTitle>

          <AnimalForm :modo="modoFormulario" :datos="animalEnEdicion" @submit="enviarFormulario" />
        </div>
      </Dialog>
  
      <!-- Mensajes de carga o vacío -->
      <div v-if="loading" class="text-center text-gray-500">Cargando animales...</div>

      <div v-else-if="store.lista.length === 0" class="text-center text-gray-500">
        No hay animales registrados.
      </div>

      <!-- Cards -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="animal in store.lista"
          :key="animal.id"
          class="bg-white border rounded-xl shadow p-4 flex flex-col justify-between"
        >
          <div>
            <h2 class="text-xl font-bold text-green-700">{{ animal.nombre }}</h2>
            <p class="text-sm text-gray-600"><strong>Especie:</strong> {{ animal.especie }}</p>
            <p class="text-sm text-gray-600">
              <strong>Estado: </strong>
              <span
                :class="animal.estado === 'adoptado' ? 'text-red-500' : 'text-green-600'"
                class="font-medium"
              >
                {{ animal.estado }}
              </span>
            </p>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button
              class="text-yellow-500 hover:text-yellow-600"
              @click="abrirModalEditar(animal)"
              title="Editar"
            >
              ✏️
            </button>
            <button
              class="text-blue-500 hover:text-blue-600"
              @click="cambiarEstado(animal)"
              title="Cambiar estado"
            >
              🔄
            </button>
            <button
              class="text-red-500 hover:text-red-600"
              @click="eliminarAnimal(animal)"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue'
  import { useAnimalesStore } from '../stores/animales'
  import AnimalForm from '../components/AnimalForm.vue'
  
  const store = useAnimalesStore()
  const loading = computed(() => store.loading)
  
  const mostrarFormulario = ref(false)
  const modoFormulario = ref('agregar') // 'agregar' o 'editar'
  const animalEnEdicion = ref(null)
  
  onMounted(() => {
    if (store.lista.length === 0) {
      store.cargarAnimales()
    }
  })
  
  async function cambiarEstado(animal) {
    const nuevoEstado = animal.estado === 'adoptado' ? 'en_adopcion' : 'adoptado'
    const { error } = await store.actualizarEstado(animal.id, nuevoEstado)
    if (!error) await store.cargarAnimales()
  }
  
  async function eliminarAnimal(animal) {
    if (!animal || !animal.id) {
        console.error("Error: El animal no tiene un ID válido:", animal);
        alert("⚠️ Error al eliminar: El animal no tiene un ID válido.");
        return;
    }

    if (confirm('¿Estás seguro de eliminar este animal?')) {
        const { error } = await store.eliminarAnimal(animal.id, animal.foto_url);
        if (!error) {
            await store.cargarAnimales();
        } else {
            console.error('Error al eliminar animal:', error);
            alert(error);
        }
    }
  }
  
  async function enviarFormulario(datos) {
    if (modoFormulario.value === 'agregar') {
      const { error } = await store.agregarAnimal(datos)
      if (!error) {
        cerrarModal()
        await store.cargarAnimales()
      }
    } else {
      const { error } = await store.editarAnimal(animalEnEdicion.value.id, datos)
      if (!error) {
        cerrarModal()
        await store.cargarAnimales()
      }
    }
  }
  
  function abrirModalAgregar() {
    modoFormulario.value = 'agregar'
    animalEnEdicion.value = null
    mostrarFormulario.value = true
  }
  
  function abrirModalEditar(animal) {
    modoFormulario.value = 'editar'
    animalEnEdicion.value = { ...animal }
    mostrarFormulario.value = true
  }
  
  function cerrarModal() {
    mostrarFormulario.value = false
    animalEnEdicion.value = null
  }
  </script>
  