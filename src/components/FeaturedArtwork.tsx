import React from 'react';

export default function FeaturedArtwork() {
  return (
    <section className="featured-artwork">
      <div className="featured-artwork__grid">
        <div className="featured-artwork__image">
          <img
            src="https://images.unsplash.com/photo-1618331835717-801e976710b2?w=1200&h=900&fit=crop&auto=format"
            alt="Detalle de obra Tierra del Viento"
          />
        </div>
        <div className="featured-artwork__info">
          <span className="eyebrow">Pieza Principal · Gran Formato</span>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            Tierra del Viento (2024)
          </h2>
          <div className="featured-artwork__meta">
            <span>Óleo sobre tela</span>
            <span className="divider" />
            <span>160 × 130 cm</span>
            <span className="divider" />
            <span>Obra Única</span>
          </div>
          <p style={{ color: '#4a453f', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '500px' }}>
            Una composición inmersiva que explora la memoria colectiva del paisaje bonaerense y sus figuras gestuales. La materia pictórica trabajada en capas superpuestas revela la textura física del lienzo y la densidad del óleo.
          </p>
          <div className="featured-artwork__price-row">
            <span className="price">$480.000 ARS</span>
            <a href="#contacto" className="btn btn-primary">
              Consultar adquisición
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
