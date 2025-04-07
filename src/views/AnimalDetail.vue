<template>
    <div class="max-w-2xl mx-auto px-4 py-4">
      <div v-if="loading" class="text-center text-gray-500">Cargando detalles...</div>
      <div v-else-if="!animal" class="text-center text-red-500">Animal no encontrado.</div>
      <div v-else class="bg-white shadow rounded-xl overflow-hidden">
        <img :src="animal.foto_url" :alt="animal.nombre" class="w-full h-80 object-cover" />
        <div class="p-6">
          <h1 class="text-3xl mb-3 font-bold text-green-700">{{ animal.nombre }}</h1>
          <ul class="text-sm text-gray-700 space-y-2">
            <li>
              Soy {{ fraseSexo(animal.sexo) }}, tengo {{ formatearEdad(animal.edad_aprox) }}
            </li>
            <li>{{ animal.estado === 'adoptado' ? 'Ya encontré una familia que me quiere 💚' : 'Estoy buscando un hogar lleno de amor 🏡' }}</li>
            <li>Me rescataron el {{ formatearFecha(animal.fecha_rescate) }}</li>
          </ul>

          <p
            v-if="animal.historia && animal.historia.trim() !== ''"
            class="text-gray-600 mt-4 italic border-l-4 border-green-600 pl-4"
          >
            “Esta es mi historia: {{ animal.historia }}”
          </p>

          <a
            v-if="whatsappLink"
            :href="whatsappLink"
            target="_blank"
            class="inline-block bg-green-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700 transition"
            >
            Dame una oportunidad ❤
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAnimalesStore } from '../stores/animales'

const route = useRoute()
const store = useAnimalesStore()
const id = route.params.id
const animal = ref(null)
const loading = ref(true)

const whatsappLink = computed(() => {
  if (!animal.value || !animal.value.contacto || animal.value.estado !== 'en_adopcion') return null
  const base = `https://wa.me/${animal.value.contacto}`
  const message = `Hola, quisiera adoptar a "${animal.value.nombre}", me podrías brindar más información.`
  return `${base}?text=${encodeURIComponent(message)}`
})

onMounted(async () => {
  if (store.lista.length === 0) {
    await store.cargarAnimales()
  }

  animal.value = store.getAnimalPorId(id)
  loading.value = false
})

function formatearFecha(fechaISO) {
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' }
  return new Date(fechaISO).toLocaleDateString('es-ES', opciones)
}

function formatearEdad(meses) {
  if (meses === 0) return "recién nacido"
  if (meses === 1) return "1 mes"
  if (meses < 12) return `${meses} meses`

  const años = Math.floor(meses / 12)
  const resto = meses % 12

  let texto = años === 1 ? "1 año" : `${años} años`
  if (resto === 1) texto += " y 1 mes"
  else if (resto > 1) texto += ` y ${resto} meses`

  return texto
}

function fraseSexo(sexo) {
  return sexo === 'macho' ? 'un macho' : 'una hembra'
}
  </script>
  