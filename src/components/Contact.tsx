import React, { useState } from 'react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', type: 'compra', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contacto" style={{ padding: '6rem 0', backgroundColor: '#ece6da' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <span className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>Contacto & Encargos</span>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Escribile a Mora</h2>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f6f0', border: '1px solid #ded6c6' }}>
            <h3 className="font-display" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>¡Mensaje enviado!</h3>
            <p style={{ color: '#4a453f' }}>Gracias por comunicarte. Mora responderá a tu correo a la brevedad.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#f8f6f0', padding: '2.5rem', border: '1px solid #ded6c6' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Nombre completo</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded6c6', outline: 'none' }}
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded6c6', outline: 'none' }}
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Tipo de consulta</label>
              <select
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded6c6', outline: 'none', backgroundColor: '#fff' }}
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value })}
              >
                <option value="compra">Compra de obra original</option>
                <option value="print">Prints Fine Art</option>
                <option value="mural">Proyecto o Encargo de Mural</option>
                <option value="exposicion">Muestras y Prensa</option>
                <option value="otro">Otra consulta</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Mensaje</label>
              <textarea
                rows={5}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded6c6', outline: 'none', resize: 'vertical' }}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Enviar mensaje →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
