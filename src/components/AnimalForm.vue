<template>
  <form @submit.prevent="enviar" class="space-y-4">
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nombre:</label>
        <input v-model="form.nombre" class="input" />
        <p v-if="errors.nombre" class="text-red-500 text-xs mt-1">{{ errors.nombre }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Especie:</label>
        <select v-model="form.especie" class="input">
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Sexo:</label>
        <select v-model="form.sexo" class="input">
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Edad aprox. (en meses):</label>
        <input v-model="form.edad_aprox" type="number" min="0" class="input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Estado:</label>
        <select v-model="form.estado" class="input">
          <option value="en_adopcion">En adopción</option>
          <option value="adoptado">Adoptado</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Fecha rescate:</label>
        <input type="date" v-model="form.fecha_rescate" class="input" />
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Historia:</label>
        <textarea v-model="form.historia" class="input"></textarea>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Foto del animal:</label>
        <input type="file" accept="image/*" @change="seleccionarImagen" class="input" />
        <p v-if="errors.foto" class="text-red-500 text-xs mt-1">{{ errors.foto }}</p>
        <p v-if="cargandoImagen" class="text-sm text-gray-500 mt-1">Subiendo imagen...</p>
        <img v-if="preview" :src="preview" class="mt-2 w-40 h-auto rounded" />
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">Contacto:</label>
        <select v-model="form.contacto" class="input">
          <option value="573153408734">+57 315 3408734</option>
          <option value="573214895747">+57 321 4895747</option>
        </select>
      </div>
    </div>

    <button type="submit" class="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
      {{ modo === "editar" ? "Guardar cambios" : "Agregar animal" }}
    </button>
  </form>
</template>

<script setup>
import { reactive, watch, ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";

const props = defineProps({
  modo: { type: String, default: "agregar" },
  datos: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["submit"]);

const form = reactive({
  nombre: "",
  especie: "perro",
  sexo: "macho",
  edad_aprox: "",
  estado: "en_adopcion",
  historia: "",
  fecha_rescate: "",
  foto_url: "",
  contacto: "573153408734",
});

const errors = reactive({
  nombre: "",
  foto: "",
});

const cargandoImagen = ref(false);
const archivoImagen = ref(null);
const preview = ref(null);

// 🔹 Establecer la fecha actual en "fecha_rescate"
onMounted(() => {
  form.fecha_rescate = new Date().toISOString().split("T")[0];
});

// 🔹 Cargar datos si está en modo edición
watch(
  () => props.datos,
  (val) => {
    if (val) {
      Object.assign(form, val);

      if (!form.especie) form.especie = "perro";
      if (!form.sexo) form.sexo = "macho";
      if (!form.estado) form.estado = "en_adopcion";
      if (!form.contacto) form.contacto = "573153408734";

      preview.value = form.foto_url;
    }
  },
  { immediate: true }
);

// 🔹 Limpiar error del nombre al escribir
watch(() => form.nombre, (nuevoValor) => {
  if (nuevoValor.trim()) {
    errors.nombre = "";
  }
});

// 📌 Validación antes de enviar
const validarFormulario = () => {
  errors.nombre = form.nombre ? "" : "El nombre es obligatorio";
  errors.foto = archivoImagen.value || form.foto_url ? "" : "La imagen es obligatoria";

  return !errors.nombre && !errors.foto;
};

// 📌 Manejar selección de imagen
const seleccionarImagen = (e) => {
  archivoImagen.value = e.target.files[0];
  if (archivoImagen.value) {
    preview.value = URL.createObjectURL(archivoImagen.value);
    errors.foto = ""; // ✅ Limpiar error al subir imagen
  }
};

// 📌 Enviar formulario
const enviar = async () => {
  if (!validarFormulario()) return;

  let nuevaUrl = null;

  if (archivoImagen.value) {
    cargandoImagen.value = true;
    const nombreArchivo = `${Date.now()}_${archivoImagen.value.name}`;

    const { error: errorSubida } = await supabase.storage.from("imagenes").upload(nombreArchivo, archivoImagen.value);

    if (errorSubida) {
      alert("❌ Error al subir imagen.");
      cargandoImagen.value = false;
      return;
    }

    const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(nombreArchivo);

    nuevaUrl = urlData.publicUrl;
  }

  // 🔹 Si está en modo edición, eliminar la imagen anterior si se sube una nueva
  if (props.modo === "editar" && nuevaUrl && form.foto_url) {
    const rutaRelativa = decodeURIComponent(
      new URL(form.foto_url).pathname.replace("/storage/v1/object/public/imagenes/", "").replace(/^\/+/, "")
    );

    if (rutaRelativa) {
      const { error: errorEliminar } = await supabase.storage.from("imagenes").remove([rutaRelativa]);
      if (errorEliminar) {
        console.warn("❌ Error al eliminar imagen anterior:", errorEliminar.message);
      }
    }
  }

  if (nuevaUrl) {
    form.foto_url = nuevaUrl;
  }

  emit("submit", { ...form, edad_aprox: parseInt(form.edad_aprox) });
  cargandoImagen.value = false;
};
</script>

<style scoped>
.input {
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  width: 100%;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
}
</style>
