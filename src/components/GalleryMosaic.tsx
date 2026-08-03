import React from 'react';

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&h=750&fit=crop&auto=format', alt: 'Obra 1', tall: true },
  { src: 'https://images.unsplash.com/photo-1618331833071-ce81bd50d300?w=600&h=400&fit=crop&auto=format', alt: 'Obra 2', tall: false },
  { src: 'https://images.unsplash.com/photo-1533208087231-c3618eab623c?w=600&h=400&fit=crop&auto=format', alt: 'Obra 3', tall: false },
  { src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=750&fit=crop&auto=format', alt: 'Obra 4', tall: true },
  { src: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=600&h=400&fit=crop&auto=format', alt: 'Obra 5', tall: false },
];

export default function GalleryMosaic() {
  return (
    <section className="gallery-mosaic">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="eyebrow">Visuales & Texturas</span>
          <h2 className="section-title">Galería de archivo</h2>
        </div>
        <div className="gallery-mosaic__grid">
          {GALLERY_IMAGES.map((img, idx) => (
            <div key={idx} className={`item ${img.tall ? 'item--tall' : ''}`}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
