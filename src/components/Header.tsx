import React, { useState, useEffect } from 'react';

interface HeaderProps {
  cartCount: number;
}

const NAV_ITEMS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Obra', href: '#obra' },
  { label: 'Prints', href: '#prints' },
  { label: 'Murales', href: '#murales' },
  { label: 'Sobre Mora', href: '#sobre-mora' },
  { label: 'Exhibiciones', href: '#exhibiciones' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Header({ cartCount }: HeaderProps) {
  const [isOverHero, setIsOverHero] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if scroll is within hero height (approx 800px)
      const heroHeight = document.getElementById('hero')?.offsetHeight || 700;
      setIsOverHero(window.scrollY < heroHeight - 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`main-header ${
        isOverHero ? 'main-header--transparent' : 'main-header--scrolled'
      }`}
    >
      <div className="container">
        {/* Toggle mobile menu */}
        <button
          className="main-header__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -5px)' : 'none' }} />
        </button>

        {/* Logo */}
        <a href="#hero" className="main-header__logo">
          Mora Petraglia
        </a>

        {/* Desktop Nav */}
        <nav className="main-header__nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Cart Action */}
        <div className="main-header__actions">
          <button className="main-header__cart-btn" aria-label="Carrito">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="main-header__mobile-menu">
          <nav>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
