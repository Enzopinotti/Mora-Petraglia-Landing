import React from 'react';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="main-footer__grid">
          <div className="main-footer__brand">
            <h3>Mora Petraglia</h3>
            <p>
              Artista plástica y muralista.<br />
              La Plata, Buenos Aires, Argentina.
            </p>
            <div className="main-footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>

          <div className="main-footer__column">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#obra">Obra original</a></li>
              <li><a href="#prints">Prints</a></li>
              <li><a href="#murales">Murales</a></li>
              <li><a href="#sobre-mora">Sobre Mora</a></li>
            </ul>
          </div>

          <div className="main-footer__column">
            <h4>Servicios</h4>
            <ul>
              <li><a href="#contacto">Encargos privados</a></li>
              <li><a href="#contacto">Proyectos urbanos</a></li>
              <li><a href="#contacto">Envíos & Enbalaje</a></li>
              <li><a href="#contacto">Certificación</a></li>
            </ul>
          </div>

          <div className="main-footer__column">
            <h4>Contacto</h4>
            <ul>
              <li><a href="mailto:contacto@morapetraglia.com">contacto@morapetraglia.com</a></li>
              <li><span>La Plata, Argentina</span></li>
            </ul>
          </div>
        </div>

        <div className="main-footer__bottom">
          <p>© {new Date().getFullYear()} Mora Petraglia. Todos los derechos reservados.</p>
          <p>Portfolio & Tienda Oficial de Arte</p>
        </div>
      </div>
    </footer>
  );
}
