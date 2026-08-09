import { useCms } from '../context/CmsContext'
import { SOCIAL_LINKS } from '../data/landing'

export default function Footer() {
  const { getContent, getSetting } = useCms()

  const instagramUrl = getSetting('instagram', SOCIAL_LINKS.instagram)
  const contactEmail = getSetting('email', 'contacto@morapetraglia.com')
  const footerLocation = getContent('footer.location', 'La Plata, Buenos Aires, Argentina.')

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="main-footer__grid">
          <div className="main-footer__brand">
            <h3>Mora Petraglia</h3>
            <p>
              Artista plástica y muralista.<br />
              {footerLocation}
            </p>
            <div className="main-footer__socials">
              <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
              <a href="#contacto">Contacto</a>
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
              <li><a href="#prints">Prints fine art</a></li>
              <li><a href="#contacto">Certificación</a></li>
            </ul>
          </div>

          <div className="main-footer__column">
            <h4>Contacto</h4>
            <ul>
              <li><a href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
              <li><span>La Plata, Argentina</span></li>
            </ul>
          </div>
        </div>

        <div className="main-footer__bottom">
          <p>© {new Date().getFullYear()} Mora Petraglia. Todos los derechos reservados.</p>
          <p>
            Desarrollado por{' '}
            <a href="https://enzopinotti.dev" target="_blank" rel="noreferrer">
              Enzo Pinotti
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
