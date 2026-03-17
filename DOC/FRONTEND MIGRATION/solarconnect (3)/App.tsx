import React, { useState } from 'react';
import { Hero } from './components/home/Hero';
import { BlogSection } from './components/home/BlogSection';
import { NewsSection } from './components/home/NewsSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { ComponentLibrary } from './pages/ComponentLibrary';
import { LayoutStructure } from './pages/LayoutStructure';
import { Dashboard } from './pages/Dashboard';
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
      ) : currentPage === 'components' ? (
        <ComponentLibrary activePage="components" onNavigate={setCurrentPage} />
      ) : currentPage === 'layout-structure' ? (
        <LayoutStructure activePage="layout-structure" onNavigate={setCurrentPage} />
      ) : currentPage === 'dashboard' ? (
        <Dashboard activePage="dashboard" onNavigate={setCurrentPage} />
      ) : null}
    </main>
  );
};

export default App;