// src/stores/animales.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAnimalesStore = defineStore('animales', {
  state: () => ({
    lista: [],
    loading: false,
    error: null,
  }),

  actions: {
    async cargarAnimales() {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
        .from('animales')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        this.error = error.message
      } else {
        this.lista = data
      }

      this.loading = false
    },

    getAnimalPorId(id) {
      return this.lista.find(a => a.id === id)
    },

    especiesDisponibles() {
      return [...new Set(this.lista.map(a => a.especie).filter(Boolean))].sort()
    },

    estadosDisponibles() {
      return [...new Set(this.lista.map(a => a.estado).filter(Boolean))].sort()
    },

    async actualizarEstado(id, nuevoEstado) {
        const { error } = await supabase
            .from('animales')
            .update({ estado: nuevoEstado })
            .eq('id', id)
        
        return { error }
    },

    async agregarAnimal(nuevoAnimal) {
        const { data, error } = await supabase
          .from('animales')
          .insert([nuevoAnimal])
          .select()
        
        if (!error && data?.[0]) {
          this.lista.unshift(data[0]) // lo agregamos en la lista
        }
      
        return { data, error }
    },
      
    async editarAnimal(id, camposEditados) {
        const { error } = await supabase
          .from('animales')
          .update(camposEditados)
          .eq('id', id)
      
        if (!error) {
          await this.cargarAnimales() // recarga después de editar
        }
      
        return { error }
    },      
        
    async eliminarAnimal(id, foto_url) {
      try {
          if (foto_url) {
              const urlPartes = foto_url.split('/');
              const nombreArchivo = urlPartes[urlPartes.length - 1];
  
              // Eliminar la imagen del bucket de Supabase
              const { error: errorImagen } = await supabase
                  .storage
                  .from('imagenes')
                  .remove([nombreArchivo]);
  
              if (errorImagen) {
                  console.error('Error al eliminar imagen:', errorImagen.message);
                  return { error: 'No se pudo eliminar la imagen del servidor.' };
              }
          }
  
          // Eliminar el animal de la base de datos
          const { error } = await supabase
              .from('animales')
              .delete()
              .eq('id', id);
  
          if (!error) {
              this.lista = this.lista.filter(animal => animal.id !== id); // Eliminar localmente
          }
  
          return { error };
      } catch (error) {
          console.error('Error inesperado:', error);
          return { error: 'Error inesperado al eliminar el animal.' };
      }
    }  
  }
})
