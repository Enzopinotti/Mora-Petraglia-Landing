import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import WorkCard, { WorkItem } from './WorkCard';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_WORKS: WorkItem[] = [
  {
    id: 1,
    title: 'Eva y el Mar',
    year: '2024',
    technique: 'Óleo sobre tela',
    size: '120 × 100 cm',
    availability: 'Disponible',
    price: '$320.000',
    image: 'https://images.unsplash.com/flagged/photo-1567934150921-7632371abb32?w=700&h=880&fit=crop&auto=format',
    category: 'obra',
  },
  {
    id: 2,
    title: 'La 10 en la Pampa',
    year: '2023',
    technique: 'Óleo sobre madera',
    size: '90 × 70 cm',
    availability: 'En exposición',
    price: 'Consultar',
    image: 'https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?w=700&h=880&fit=crop&auto=format',
    category: 'obra',
  },
  {
    id: 3,
    title: 'Moria Pop',
    year: '2024',
    technique: 'Acrílico y óleo sobre tela',
    size: '110 × 110 cm',
    availability: 'Disponible',
    price: '$290.000',
    image: 'https://images.unsplash.com/photo-1618331833071-ce81bd50d300?w=700&h=880&fit=crop&auto=format',
    category: 'obra',
  },
  {
    id: 4,
    title: 'Poética de la Siesta',
    year: '2023',
    technique: 'Óleo sobre tela',
    size: '80 × 60 cm',
    availability: 'Edición limitada',
    price: '$180.000',
    image: 'https://images.unsplash.com/photo-1533208087231-c3618eab623c?w=700&h=880&fit=crop&auto=format',
    category: 'print',
  },
];

export default function FeaturedWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.featured-works .eyebrow', {
        y: 12,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      gsap.from('.featured-works .section-title', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });

      gsap.from('.work-card', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.featured-works__grid',
          start: 'top 82%',
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="obra" className="featured-works" ref={sectionRef}>
      <div className="container">
        <div className="featured-works__header">
          <div>
            <span className="eyebrow">Selección curatorial</span>
            <h2 className="section-title">Obras destacadas</h2>
          </div>
          <a href="#catalogo" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem' }}>
            Ver catálogo completo →
          </a>
        </div>

        <div className="featured-works__grid">
          {FEATURED_WORKS.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}
