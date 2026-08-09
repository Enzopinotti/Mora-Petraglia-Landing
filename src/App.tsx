import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import AdminApp from './admin/AdminApp'
import AboutMora from './components/AboutMora'
import Contact from './components/Contact'
import Exhibitions from './components/Exhibitions'
import Footer from './components/Footer'
import GalleryMosaic from './components/GalleryMosaic'
import Header from './components/Header'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Prints from './components/Prints'
import SiteMeta from './components/SiteMeta'
import { CmsProvider, useCms } from './context/CmsContext'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function LandingContent() {
  const appRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      gsap.utils.toArray<HTMLElement>('.section-heading').forEach((heading) => {
        const pieces = heading.querySelectorAll('.section-kicker, .section-title, p')

        gsap.from(pieces, {
          y: 34,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 82%',
          },
        })
      })

      gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter(
          (element) =>
            !element.matches(
              '.section-heading, .print-card, .prints__featured-heading, .featured-artwork-panel, .gallery-item, .exhibition-card',
            ),
        )
        .forEach((element) => {
          gsap.from(element, {
            y: 42,
            opacity: 0,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 84%',
            },
          })
        })

      const revealGroups = [
        { selector: '.print-card', y: 78, stagger: 0.08 },
        { selector: '.prints__featured-heading', y: 42, stagger: 0.08 },
        { selector: '.featured-artwork-panel', y: 70, stagger: 0.08 },
        { selector: '.gallery-item', y: 86, stagger: 0.12 },
        { selector: '.exhibition-card', y: 64, stagger: 0.1 },
      ]

      revealGroups.forEach(({ selector, y, stagger }) => {
        const elements = gsap.utils.toArray<HTMLElement>(selector)
        const trigger = elements[0]?.parentElement

        if (!trigger) return

        gsap.from(elements, {
          y,
          opacity: 0,
          scale: 0.96,
          rotateX: 5,
          transformOrigin: '50% 100%',
          clipPath: 'inset(10% 0% 10% 0%)',
          duration: 1.05,
          stagger,
          ease: 'power4.out',
          scrollTrigger: {
            trigger,
            start: 'top 78%',
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
        gsap.to(element, {
          yPercent: Number(element.dataset.parallax || -8),
          ease: 'none',
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      })
    },
    { scope: appRef },
  )

  return (
    <div className="site-shell" ref={appRef}>
      <SiteMeta />
      <Header />
      <Hero />
      <main>
        <Intro />
        <Prints />
        <GalleryMosaic />
        <AboutMora />
        <Exhibitions />
      </main>
      <Contact />
      <Footer />
    </div>
  )
}

function PublicLandingGate() {
  const { loading } = useCms()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#12100f',
          color: '#f5ede0',
          fontFamily: 'Cormorant Garamond, serif',
          gap: '1.5rem',
        }}
      >
        <h1 style={{ fontWeight: 300, fontSize: '2.5rem', letterSpacing: '0.1em', animation: 'pulse-loader 2s infinite ease-in-out' }}>
          Mora Petraglia
        </h1>
        <style>{`
          @keyframes pulse-loader {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return <LandingContent />
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => window.location.pathname.startsWith('/admin'))

  useEffect(() => {
    const handlePopState = () => {
      setIsAdmin(window.location.pathname.startsWith('/admin'))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <CmsProvider>
      {isAdmin ? <AdminApp /> : <PublicLandingGate />}
    </CmsProvider>
  )
}
