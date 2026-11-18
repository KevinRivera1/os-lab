import { ModulePage, type KeyTerm, type TheorySection } from '../components/ModulePage'

const sections: TheorySection[] = [
  {
    title: 'Memoria principal',
    body: 'La memoria principal almacena instrucciones y datos que la CPU necesita en cada instante. El SO debe repartirla entre los procesos residentes y proteger sus regiones.',
    bullets: [
      'Asignación contigua simple y particionada.',
      'Estrategias de huecos: first fit, best fit y worst fit.',
      'Fragmentación interna y externa.',
    ],
  },
  {
    title: 'Paginación',
    body: 'La paginación elimina la fragmentación externa dividiendo la memoria lógica en bloques de tamaño fijo llamados páginas y la memoria física en marcos del mismo tamaño.',
    bullets: [
      'Una dirección lógica se divide en número de página y desplazamiento.',
      'La tabla de páginas traduce cada página a un marco.',
      'El desplazamiento se conserva en la traducción.',
    ],
    note: 'En el laboratorio podrás cambiar el tamaño de página y ver cómo cambia el número de marcos necesarios.',
  },
  {
    title: 'Memoria virtual y reemplazo',
    body: 'La memoria virtual permite ejecutar procesos cuyo espacio lógico excede la memoria física. Cuando la página solicitada no está residente ocurre un fallo de página.',
    bullets: [
      'FIFO: sustituye la página más antigua.',
      'LRU: sustituye la página usada menos recientemente.',
      'Óptimo (OPT): sustituye la página que se usará más tarde; sirve como referencia teórica.',
    ],
  },
]

const terms: KeyTerm[] = [
  { term: 'Marco', definition: 'Bloque de memoria física del mismo tamaño que una página.' },
  { term: 'Page fault', definition: 'Evento que ocurre cuando una página referenciada no está en memoria física.' },
  { term: 'TLB', definition: 'Caché de las traducciones de direcciones más recientes.' },
  { term: 'Working set', definition: 'Conjunto de páginas que un proceso usa con frecuencia en un intervalo.' },
]

export function Memory() {
  return (
    <ModulePage
      moduleId="memory"
      intro="Asigna bloques, traduce direcciones y provoca fallos de página para entender qué ocurre detrás de cada acceso a memoria."
      sections={sections}
      terms={terms}
    />
  )
}
