import { useEffect, useState } from 'react'
import { useCms } from '../context/CmsContext'
import { SOCIAL_LINKS } from '../data/landing'

const NAV_ITEMS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Prints', href: '#prints' },
  { label: 'Obra', href: '#obra' },
  { label: 'Murales', href: '#murales' },
  { label: 'Sobre Mora', href: '#sobre-mora' },
  { label: 'Exhibiciones', href: '#exhibiciones' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Header() {
  const { getContent, getSetting } = useCms()
  const [isOverHero, setIsOverHero] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const announcementText = getContent(
    'header.announcement',
    'Prints de edición limitada disponibles · Envíos a Argentina y exterior',
  )
  const instagramUrl = getSetting('instagram', SOCIAL_LINKS.instagram)

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero')
      const heroBottom = (hero?.offsetTop || 0) + (hero?.offsetHeight || 720)
      setIsOverHero(window.scrollY < heroBottom - 90)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`main-header ${isOverHero ? 'main-header--over-hero' : 'main-header--scrolled'} ${
        menuOpen ? 'main-header--open' : ''
      }`}
    >
      <div className="main-header__announcement">{announcementText}</div>

      <div className="main-header__bar">
        <div className="container main-header__inner">
          <a href="#hero" className="main-header__logo" onClick={closeMenu}>
            Mora Petraglia
          </a>

          <nav className="main-header__nav" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="main-header__actions">
            <a className="main-header__social" href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <button
              className="main-header__toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <div className="main-header__mobile-menu" aria-hidden={!menuOpen}>
        <nav aria-label="Navegación móvil">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a href={instagramUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Instagram
          </a>
        </nav>
      </div>
    </header>
  )
}
