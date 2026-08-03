import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="newsletter">
      <div className="container">
        <span className="eyebrow" style={{ color: '#83927b' }}>
          Contacto editorial
        </span>
        <h2 className="section-title">Recibir novedades y catálogo</h2>
        <p>Suscribite para enterarte de nuevas obras, ediciones limitadas de prints y muestras.</p>

        {submitted ? (
          <p style={{ color: '#83927b', fontStyle: 'italic' }}>
            ¡Gracias por suscribirte! Te mantendremos al tanto de las novedades.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#c89d53', borderColor: '#c89d53', color: '#141712' }}>
              Suscribirme
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
