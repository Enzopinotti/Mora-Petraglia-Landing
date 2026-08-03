import { useState } from 'react';

import AnnounceBar from './components/AnnounceBar';
import Header from './components/Header';
import Hero from './components/Hero';
import Intro from './components/Intro';
import FeaturedWorks from './components/FeaturedWorks';
import Categories from './components/Categories';
import FeaturedArtwork from './components/FeaturedArtwork';
import AboutMora from './components/AboutMora';
import GalleryMosaic from './components/GalleryMosaic';
import Benefits from './components/Benefits';
import Contact from './components/Contact';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div>
      <AnnounceBar />
      <Header cartCount={cartCount} />
      <Hero />
      <Intro />
      <FeaturedWorks />
      <Categories />
      <FeaturedArtwork />
      <AboutMora />
      <GalleryMosaic />
      <Benefits />
      <Contact />
      <Newsletter />
      <Footer />
    </div>
  );
}
