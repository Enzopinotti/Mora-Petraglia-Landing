import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero__media video', {
        scale: 1.06,
        opacity: 0.68,
        duration: 1.4,
        ease: 'power2.out',
      })
        .from(
          '.hero__kicker',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          '-=1',
        )
        .from(
          '.hero__title span',
          {
            y: 64,
            opacity: 0,
            stagger: 0.12,
            duration: 0.95,
          },
          '-=0.35',
        )
        .from(
          '.hero__description',
          {
            y: 22,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.55',
        )
        .from(
          '.hero__actions a',
          {
            y: 16,
            opacity: 0,
            stagger: 0.1,
            duration: 0.55,
          },
          '-=0.45',
        )
    },
    { scope: containerRef },
  )

  return (
    <section id="hero" className="hero" ref={containerRef}>
      <div className="hero__media">
        <video autoPlay muted loop playsInline poster="/videos/hero-poster.webp">
          <source media="(min-width: 768px)" src="/videos/hero-desktop.webm" type="video/webm" />
          <source src="/videos/hero-mobile.webm" type="video/webm" />
          <source media="(min-width: 768px)" src="/videos/hero-desktop.mp4" type="video/mp4" />
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
          <img src="/videos/hero-poster.webp" alt="Mora Petraglia — Artista Plástica y Muralista" />
        </video>
      </div>

      <div className="hero__scrim" />

      <div className="container hero__content">
        <div className="hero__copy">
          <span className="hero__kicker">Artista plástica y muralista · La Plata</span>
          <h1 className="hero__title">
            <span>Mora</span>
            <span>Petraglia</span>
          </h1>
          <p className="hero__description">
            Retratos pop, murales y cultura popular argentina en una obra de color intenso, memoria urbana y personajes que vuelven a mirar desde la calle.
          </p>
          <div className="hero__actions">
            <a href="#prints" className="btn btn-primary">
              Ver prints
            </a>
            <a href="#obra" className="btn btn-light">
              Ver obra
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
