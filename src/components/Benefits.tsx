import React from 'react';

const BENEFITS_LIST = [
  { title: 'Obra certificada', text: 'Cada obra incluye certificado impreso de autenticidad firmado por la artista.' },
  { title: 'Prints Fine Art', text: 'Impresión de calidad museo sobre papeles de algodón de alto gramaje.' },
  { title: 'Envíos asegurados', text: 'Embalaje protegido y envíos a todo el territorio argentino y exterior.' },
  { title: 'Atención personalizada', text: 'Asesoramiento directo para coleccionistas y proyectos de arquitectura.' },
  { title: 'Murales a medida', text: 'Propuestas conceptuales y ejecución de murales públicos o privados.' },
];

export default function Benefits() {
  return (
    <section className="benefits">
      <div className="container">
        <div className="benefits__grid">
          {BENEFITS_LIST.map((item, idx) => (
            <div key={idx} className="benefits__item">
              <div className="line" />
              <h4 className="font-display">{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
