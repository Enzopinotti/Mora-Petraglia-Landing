import React from 'react';
import aboutImage from '../assets/images/about-mora.png';

export default function AboutMora() {
  return (
    <section id="sobre-mora" className="about-mora">
      <div className="container">
        <div className="about-mora__grid">
          <div className="about-mora__image-wrapper">
            <img
              src={aboutImage}
              alt="Mora Petraglia — Artista plástica y muralista"
            />
          </div>
          <div>
            <span className="eyebrow">Sobre la artista</span>
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
              Mora Petraglia
            </h2>
            <div
              style={{
                color: '#45403a',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginBottom: '2.25rem',
              }}
            >
              <p>
                Artista plástica y muralista nacida y radicada en La Plata, Buenos Aires. Su trabajo indaga en las raíces de la cultura popular argentina, combinando el retrato expresivo, el contraste de bloques de color e intensas texturas pictóricas.
              </p>
              <p>
                Sus lienzos y murales rescatan figuras icónicas del imaginario colectivo como Eva Perón, Diego Maradona, Alejandra Pizarnik y Moria Casán, abordadas desde un tratamiento contemporáneo, sensible e íntimo, donde lo político trasciende la institución para convertirse en lenguaje afectivo.
              </p>
            </div>
            <a href="#contacto" className="btn btn-outline">
              Leer biografía & trayectoria →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
