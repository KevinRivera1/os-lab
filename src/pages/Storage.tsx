import { ModulePage, type KeyTerm, type TheorySection } from '../components/ModulePage'

const sections: TheorySection[] = [
  {
    title: 'Almacenamiento secundario',
    body: 'A diferencia de la memoria volátil, el almacenamiento secundario conserva la información cuando se corta la energía. El SO lo gestiona en unidades llamadas bloques o sectores.',
    bullets: [
      'Un disco se organiza en pistas, sectores y cilindros.',
      'El tiempo de acceso incluye seek, latencia rotacional y transferencia.',
      'El SO mantiene mapas de bits o listas de bloques libres.',
    ],
  },
  {
    title: 'Sistema de archivos',
    body: 'Es la abstracción que transforma bloques en archivos y directorios. Define cómo se nombran, se organizan y se protegen los datos persistentes.',
    bullets: [
      'Estructura jerárquica de directorios y archivos.',
      'Metadatos: tamaño, permisos, propietario, fechas y ubicación.',
      'Operaciones: crear, eliminar, renombrar y consultar información.',
    ],
    note: 'El laboratorio simula operaciones reales sobre un árbol de directorios en el navegador.',
  },
  {
    title: 'Métodos de asignación',
    body: 'La asignación decide cómo se colocan los bloques de un archivo en el disco. Cada método favorece distintos patrones de acceso.',
    bullets: [
      'Contigua: bloques consecutivos; acceso rápido, pero fragmentación externa.',
      'Enlazada: cada bloque apunta al siguiente; sin fragmentación externa, pero acceso secuencial.',
      'Indexada: un bloque índice guarda todos los punteros; acceso aleatorio con sobrecoste del índice.',
    ],
  },
]

const terms: KeyTerm[] = [
  { term: 'Bloque', definition: 'Unidad mínima de transferencia entre el disco y la memoria.' },
  { term: 'Inodo', definition: 'Estructura con los metadatos de un archivo y las direcciones de sus bloques.' },
  { term: 'Fragmentación externa', definition: 'Espacio libre disperso que no puede satisfacer una asignación contigua.' },
  { term: 'FAT', definition: 'Tabla de asignación de archivos usada por el método enlazado con índice global.' },
]

export function Storage() {
  return (
    <ModulePage
      moduleId="storage"
      intro="Desciende hasta los bloques de disco: crea archivos, elimina directorios y compara cómo cada método de asignación ocupa el espacio."
      sections={sections}
      terms={terms}
    />
  )
}
