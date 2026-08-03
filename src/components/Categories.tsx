import React from 'react';

const CATEGORIES_DATA = [
  {
    title: 'Obra Original',
    description: 'Piezas únicas al óleo y acrílico sobre lienzo y soporte de madera.',
    count: '34 Obras disponibles',
    icon: '◈',
  },
  {
    title: 'Prints Fine Art',
    description: 'Reproducciones seriadas, firmadas y numeradas con certificado.',
    count: '18 Ediciones',
    icon: '◫',
  },
  {
    title: 'Murales & Espacio Público',
    description: 'Intervenciones de gran formato en La Plata y Gran Buenos Aires.',
    count: 'Encargos abiertos',
    icon: '◰',
  },
  {
    title: 'Iconografía Popular',
    description: 'Series temáticas sobre figuras icónicas de la cultura argentina.',
    count: '6 Colecciones',
    icon: '◳',
  },
];

export default function Categories() {
  return (
    <section className="categories">
      <div className="container">
        <span className="eyebrow" style={{ color: '#83927b' }}>
          Explorar el universo
        </span>
        <div className="categories__grid" style={{ marginTop: '2rem' }}>
          {CATEGORIES_DATA.map((cat) => (
            <div key={cat.title} className="categories__card">
              <span className="icon">{cat.icon}</span>
              <h3 className="font-display">{cat.title}</h3>
              <p>{cat.description}</p>
              <span className="count">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
