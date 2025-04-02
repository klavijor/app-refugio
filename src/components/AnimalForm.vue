<template>
    <form @submit.prevent="enviar">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <label class="block text-sm">Nombre:</label>
          <input v-model="form.nombre" required class="input" />
        </div>
        <div>
          <label class="block text-sm">Especie:</label>
          <input v-model="form.especie" required class="input" />
        </div>
        <div>
          <label class="block text-sm">Sexo:</label>
          <input v-model="form.sexo" required class="input" />
        </div>
        <div>
          <label class="block text-sm">Edad aprox.:</label>
          <input v-model="form.edad_aprox" required class="input" />
        </div>
        <div>
          <label class="block text-sm">Estado:</label>
          <select v-model="form.estado" class="input">
            <option value="en_adopcion">En adopción</option>
            <option value="adoptado">Adoptado</option>
          </select>
        </div>
        <div>
          <label class="block text-sm">Fecha rescate:</label>
          <input type="date" v-model="form.fecha_rescate" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm">Historia:</label>
          <textarea v-model="form.historia" class="input"></textarea>
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm">Foto URL:</label>
          <input v-model="form.foto_url" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm">Contacto:</label>
          <input v-model="form.contacto" class="input" />
        </div>
      </div>
  
      <button type="submit" class="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        {{ modo === 'editar' ? 'Guardar cambios' : 'Agregar animal' }}
      </button>
    </form>
  </template>
  
  <script setup>
  import { reactive, watch } from 'vue'
  
  const props = defineProps({
    modo: { type: String, default: 'agregar' }, // o 'editar'
    datos: { type: Object, default: () => ({}) },
  })
  
  const emit = defineEmits(['submit'])
  
  const form = reactive({
    nombre: '',
    especie: '',
    sexo: '',
    edad_aprox: '',
    estado: 'en_adopcion',
    historia: '',
    fecha_rescate: '',
    foto_url: '',
    contacto: '',
  })
  
  watch(() => props.datos, (val) => Object.assign(form, val), { immediate: true })
  
  const enviar = () => emit('submit', { ...form })
  </script>
  
  <style scoped>
  .input {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.5rem;
    width: 100%;
  }
  </style>
  