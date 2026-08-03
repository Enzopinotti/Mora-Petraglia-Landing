import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.intro__glass-quote', {
        y: 40,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section className="intro" ref={sectionRef}>
      <div className="container">
        <div className="intro__glass-quote">
          <p className="intro__text">
            "La pintura como forma de memoria, identidad y presencia. Mora Petraglia construye imágenes intensas donde el color, la cultura popular y las figuras argentinas adquieren una nueva dimensión."
          </p>
          <a href="#sobre-mora" className="intro__link">
            Conocer a Mora →
          </a>
        </div>
      </div>
    </section>
  );
}
