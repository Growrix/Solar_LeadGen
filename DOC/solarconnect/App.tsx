import React, { useState } from 'react';
import { Hero } from './components/home/Hero';
import { BlogSection } from './components/home/BlogSection';
import { NewsSection } from './components/home/NewsSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { ComponentLibrary } from './pages/ComponentLibrary';
import { Header } from './components/layout/Header';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <main className="w-full min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header activePage={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'home' ? (
        <>
          <Hero />
          <BlogSection />
          <NewsSection />
          <NewsletterSection />
        </>
      ) : (
        <ComponentLibrary />
      )}
    </main>
  );
};

export default App;