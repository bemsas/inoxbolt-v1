import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import LogisticsInfo from '@/components/LogisticsInfo';
import Suppliers from '@/components/Suppliers';
import Catalogues from '@/components/Catalogues';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import EarlyAccessModal from '@/components/EarlyAccessModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Navbar />
      
      <main className="flex-grow">
        <Hero onOpenModal={() => setIsModalOpen(true)} />
        <ValueProps />
        <LogisticsInfo />
        <Suppliers />
        <Catalogues />
        <Contact />
      </main>

      <Footer />
      
      <EarlyAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
