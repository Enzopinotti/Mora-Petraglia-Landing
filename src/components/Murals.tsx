import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import mural1 from '../assets/images/murals/mural-1.png';
import mural2 from '../assets/images/murals/mural-2.png';
import mural3 from '../assets/images/murals/mural-3.png';
import mural4 from '../assets/images/murals/mural-4.png';

gsap.registerPlugin(ScrollTrigger);

const MURALS = [
  {
    image: mural1,
    title: 'Retrato Popular',
    location: 'La Plata, Buenos Aires',
    year: '2024',
  },
  {
    image: mural2,
    title: 'Figuras del Imaginario',
    location: 'CABA, Argentina',
    year: '2023',
  },
  {
    image: mural3,
    title: 'Identidad y Color',
    location: 'La Plata, Buenos Aires',
    year: '2024',
  },
  {
    image: mural4,
    title: 'Cultura Viva',
    location: 'Gran Buenos Aires',
    year: '2023',
  },
];

export default function Murals() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.murals-section .eyebrow', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      gsap.from('.murals-section .section-title', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });

      gsap.from('.murals-section__card', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.murals-section__grid',
          start: 'top 82%',
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="murales" className="murals-section" ref={sectionRef}>
      <div className="container">
        <span className="eyebrow">Espacio público & privado</span>
        <h2 className="section-title">Murales</h2>
        <div className="murals-section__grid">
          {MURALS.map((mural, idx) => (
            <div key={idx} className="murals-section__card">
              <img src={mural.image} alt={mural.title} loading="lazy" />
              <div className="info-overlay">
                <h3 className="font-display">{mural.title}</h3>
                <p>
                  {mural.location} · {mural.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
