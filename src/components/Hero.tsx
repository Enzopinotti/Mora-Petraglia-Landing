import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero__glass-box', {
        scale: 0.95,
        opacity: 0,
        duration: 1.1,
      })
        .from(
          titleRef.current,
          {
            y: 35,
            opacity: 0,
            duration: 1,
          },
          '-=0.7'
        )
        .from(
          textRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          '.hero__ctas .btn',
          {
            y: 15,
            opacity: 0,
            stagger: 0.15,
            duration: 0.7,
          },
          '-=0.5'
        );
    },
    { scope: containerRef }
  );

  return (
    <section id="hero" className="hero" ref={containerRef}>
      <div className="hero__media">
        <video autoPlay muted loop playsInline poster="/videos/hero-poster.jpg">
          <source media="(min-width: 768px)" src="/videos/hero-desktop.mp4" type="video/mp4" />
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
          <img src="/videos/hero-poster.jpg" alt="Mora Petraglia — Artista Plástica y Muralista" />
        </video>
      </div>

      <div className="hero__overlay" />

      <div className="hero__content">
        <div className="hero__glass-box">
          <span className="eyebrow hero__eyebrow">
            Artista plástica · Muralista · La Plata
          </span>
          <h1 ref={titleRef} className="hero__title font-display text-editorial-italic">
            Mora Petraglia
            <span>Arte, identidad y cultura popular</span>
          </h1>
          <p ref={textRef} className="hero__description">
            Una obra atravesada por la identidad argentina, la cultura popular, la memoria y los personajes que forman parte de nuestro imaginario colectivo.
          </p>
          <div ref={ctasRef} className="hero__ctas">
            <a href="#obra" className="btn btn-hero-primary">
              Ver obra
            </a>
            <a href="#prints" className="btn btn-hero-glass">
              Explorar prints
            </a>
            <a href="#murales" className="btn btn-hero-glass">
              Conocer murales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
