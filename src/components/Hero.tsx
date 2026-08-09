import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useCms } from '../context/CmsContext'

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { getContent } = useCms()

  const kicker = getContent('hero.kicker', 'Artista plástica y muralista · La Plata')
  const titlePart1 = getContent('hero.title_part1', 'Mora')
  const titlePart2 = getContent('hero.title_part2', 'Petraglia')
  const description = getContent(
    'hero.description',
    'Retratos pop, murales y cultura popular argentina en una obra de color intenso, memoria urbana y personajes que vuelven a mirar desde la calle.',
  )
  const ctaPrimary = getContent('hero.cta_primary', 'Ver prints')
  const ctaSecondary = getContent('hero.cta_secondary', 'Ver obra')

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
          <span className="hero__kicker">{kicker}</span>
          <h1 className="hero__title">
            <span>{titlePart1}</span>
            <span>{titlePart2}</span>
          </h1>
          <p className="hero__description">{description}</p>
          <div className="hero__actions">
            <a href="#prints" className="btn btn-primary">
              {ctaPrimary}
            </a>
            <a href="#obra" className="btn btn-light">
              {ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
