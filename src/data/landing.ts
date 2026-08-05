import aboutMora from '../assets/images/about-mora.webp'
import exhibitionLauraPalmer from '../assets/images/exhibitions/laura-palmer-mumbat-52-salon-nacional.webp'
import exhibitionSalonJoven from '../assets/images/exhibitions/salon-provincial-arte-joven-2024.webp'
import muralFour from '../assets/images/murals/mural-panoramico.webp'
import muralThree from '../assets/images/murals/mural-personajes-urbanos.webp'
import muralTwo from '../assets/images/murals/mural-proceso.webp'
import muralOne from '../assets/images/murals/mural-retrato-pared.webp'
import printBesoEspejoCard from '../assets/images/prints/print-beso-espejo-card.webp'
import printFreddie from '../assets/images/prints/print-freddie-cigarrillo.webp'
import printHolyBible from '../assets/images/prints/print-holy-bible.webp'
import printMujerSilla from '../assets/images/prints/print-mujer-silla.webp'
import obraDestacada from '../assets/images/works/featured/obra-destacada-cigarrillo.webp'

type Product = {
  title: string
  detail: string
  price: string
  edition: string
  size: string
  availability: string
  image: string
  imagePosition?: string
  imageScale?: string
  imageHoverScale?: string
}

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/morapetraglia/',
  mail: 'mailto:contacto@morapetraglia.com',
}

export const PRODUCTS: Product[] = [
  {
    title: 'Beso en el espejo',
    detail: 'Print fine art de retrato pop sobre caballete.',
    price: '$85.000 ARS',
    edition: 'Serie limitada',
    size: '50 x 70 cm',
    availability: 'En stock',
    image: printBesoEspejoCard,
    imagePosition: 'center center',
    imageScale: '1',
    imageHoverScale: '1.055',
  },
  {
    title: 'Fleabag',
    detail: 'Print de retrato pop con paleta rosa, azul y turquesa.',
    price: '$82.000 ARS',
    edition: 'Fine art',
    size: '60 x 60 cm',
    availability: 'En stock',
    image: printHolyBible,
  },
  {
    title: 'Maradona',
    detail: 'Edición de retrato pop con fondo azul y naranja.',
    price: '$92.000 ARS',
    edition: 'Disponible',
    size: '50 x 70 cm',
    availability: 'Consultar edición',
    image: printFreddie,
  },
  {
    title: 'Mujer en silla',
    detail: 'Composición con figura, peces y estudio pictórico.',
    price: '$110.000 ARS',
    edition: 'Bajo pedido',
    size: '70 x 100 cm',
    availability: 'Bajo pedido',
    image: printMujerSilla,
  },
]

export const FEATURED_ARTWORK = {
  title: 'Obra destacada',
  detail: 'Pintura original de alto contraste, color intenso y textura pictórica.',
  price: 'A consultar',
  edition: 'Obra original',
  size: '100 x 100 cm',
  availability: 'Consultar',
  image: obraDestacada,
  quotePrompt:
    'Para presupuestar: teléfono, ciudad o zona, medida de referencia, envío o retiro y una breve descripción.',
}

export const MURALS = [
  {
    title: 'Mora pintando',
    type: 'Mural',
    location: 'Proceso de mural',
    image: muralTwo,
    span: 'tall',
    note: 'La pintura saliendo del taller hacia escala pública.',
  },
  {
    title: 'Imaginario urbano',
    type: 'Serie mural',
    location: 'La Plata',
    image: muralThree,
    span: '',
    note: 'Color, humor e iconografía de calle en formato expandido.',
  },
  {
    title: 'Mural panorámico',
    type: 'Intervención',
    location: 'Intervención de gran formato',
    image: muralFour,
    span: '',
    note: 'Pared extendida, personajes y paleta pop para leer desde lejos.',
  },
  {
    title: 'Retrato en pared',
    type: 'Mural',
    location: 'La Plata, Buenos Aires',
    image: muralOne,
    span: '',
    note: 'Retrato urbano de gran escala, textura de muro y color saturado.',
  },
]

export const EXHIBITIONS = [
  {
    title: 'Laura Palmer',
    date: '52 Salón Nacional de Artes Visuales · MUMBAT Tandil',
    image: exhibitionLauraPalmer,
    imagePosition: 'center center',
    text: 'Obra seleccionada para el salón nacional, exhibida junto a registros de sala y montaje.',
  },
  {
    title: 'Salón Provincial de Arte Joven 2024',
    date: 'Selección oficial · 2024',
    image: exhibitionSalonJoven,
    imagePosition: 'right center',
    text: 'La obra formó parte de la selección del salón provincial de arte joven 2024.',
  },
]

export const ABOUT_IMAGE = aboutMora
