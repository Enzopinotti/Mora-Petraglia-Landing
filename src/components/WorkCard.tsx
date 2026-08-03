import React from 'react';

export interface WorkItem {
  id: number;
  title: string;
  year: string;
  technique: string;
  size: string;
  availability: string;
  price: string;
  image: string;
  category: string;
}

interface WorkCardProps {
  work: WorkItem;
}

export default function WorkCard({ work }: WorkCardProps) {
  return (
    <article className="work-card">
      <div className="work-card__image-wrap">
        <img src={work.image} alt={work.title} loading="lazy" />
        <span className={`work-card__badge work-card__badge--${work.availability === 'Disponible' ? 'available' : 'info'}`}>
          {work.availability}
        </span>
      </div>
      <div className="work-card__info">
        <h3 className="work-card__title font-display">{work.title}</h3>
        <p className="work-card__technique">
          {work.technique} · {work.size}
        </p>
        <div className="work-card__footer">
          <span className="work-card__price">{work.price}</span>
          <span className="work-card__year">{work.year}</span>
        </div>
      </div>
    </article>
  );
}
