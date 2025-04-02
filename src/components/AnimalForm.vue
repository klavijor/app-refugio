<template>
  <form @submit.prevent="enviar">
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <div>
        <label class="block text-sm">Nombre:</label>
        <input v-model="form.nombre" required class="input" />
      </div>

      <div>
        <label class="block text-sm">Especie:</label>
        <select v-model="form.especie" required class="input">
          <option value="" disabled selected>Seleccione una especie</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label class="block text-sm">Sexo:</label>
        <select v-model="form.sexo" required class="input">
          <option value="" disabled selected>Seleccione el sexo</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
      </div>

      <div>
        <label class="block text-sm">Edad aprox. (en meses o años):</label>
        <input v-model="form.edad_aprox" type="number" min="0" required class="input" />
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
        <label class="block text-sm">Foto del animal:</label>
        <input type="file" accept="image/*" @change="seleccionarImagen" class="input" />
        <p v-if="cargandoImagen" class="text-sm text-gray-500 mt-1">Subiendo imagen...</p>
        <img v-if="preview" :src="preview" class="mt-2 w-40 h-auto rounded" />
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm">Contacto:</label>
        <select v-model="form.contacto" class="input">
          <option value="" disabled selected>Seleccione un número</option>
          <option value="573153408734">+57 315 3408734</option>
          <option value="573214895747">+57 321 4895747</option>
        </select>
      </div>
    </div>

    <button type="submit" class="mt-4 bg-green-600 text-white px-4 py-2 rounded">
      {{ modo === 'editar' ? 'Guardar cambios' : 'Agregar animal' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  modo: { type: String, default: 'agregar' },
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

const cargandoImagen = ref(false)
const archivoImagen = ref(null)
const preview = ref(null)

watch(() => props.datos, (val) => {
  Object.assign(form, val)
  preview.value = form.foto_url // En edición, mostramos la actual
}, { immediate: true })

const seleccionarImagen = (e) => {
  archivoImagen.value = e.target.files[0]
  if (archivoImagen.value) {
    preview.value = URL.createObjectURL(archivoImagen.value)
  }
}

const enviar = async () => {
  let nuevaUrl = null

  if (archivoImagen.value) {
    cargandoImagen.value = true
    const nombreArchivo = `${Date.now()}_${archivoImagen.value.name}`

    // Subimos imagen nueva
    const { error: errorSubida } = await supabase
      .storage
      .from('imagenes')
      .upload(nombreArchivo, archivoImagen.value)

    if (errorSubida) {
      alert('❌ Error al subir imagen.')
      cargandoImagen.value = false
      return
    }

    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(nombreArchivo)

    nuevaUrl = urlData.publicUrl
  }

  // Eliminar imagen anterior si corresponde
  if (props.modo === 'editar' && nuevaUrl && form.foto_url) {
    const rutaRelativa = decodeURIComponent(
      new URL(form.foto_url).pathname
        .replace('/storage/v1/object/public/imagenes/', '')
        .replace(/^\/+/, '')
    )

    if (rutaRelativa) {
      const { error: errorEliminar } = await supabase.storage.from('imagenes').remove([rutaRelativa])
      if (errorEliminar) {
        console.warn('❌ Error al eliminar imagen anterior:', errorEliminar.message)
      }
    }
  }

  if (nuevaUrl) {
    form.foto_url = nuevaUrl
  }

  emit('submit', { ...form })
  cargandoImagen.value = false
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
