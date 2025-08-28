import React from 'react';
import './ScrollControls.scss';

const ScrollControls = () => {
  const sections = [
    'hero',
    'map', 
    'languages',
    'education',
    'english-level',
    'english-salary',
    'work-mode',
    'company-type',
    'salary-language',
    'salary-experience'
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const getCurrentSectionIndex = () => {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return 0;
    
    const scrollTop = mainContent.scrollTop;
    const sectionHeight = window.innerHeight;
    return Math.round(scrollTop / sectionHeight);
  };

  const scrollNext = () => {
    const currentIndex = getCurrentSectionIndex();
    const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
    scrollToSection(sections[nextIndex]);
  };

  const scrollPrev = () => {
    const currentIndex = getCurrentSectionIndex();
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollToSection(sections[prevIndex]);
  };

  const scrollToStart = () => {
    scrollToSection(sections[0]);
  };

  const scrollToEnd = () => {
    scrollToSection(sections[sections.length - 1]);
  };

  return (
    <div className="scroll-controls">
      <button 
        className="scroll-btn scroll-start" 
        onClick={scrollToStart}
        title="Ir al inicio"
      >
        ↑ 
      </button>
      <button 
        className="scroll-btn scroll-prev" 
        onClick={scrollPrev}
        title="Sección anterior"
      >
        ⟨
      </button>
      <button 
        className="scroll-btn scroll-next" 
        onClick={scrollNext}
        title="Siguiente sección"
      >
        ⟩
      </button>
      <button 
        className="scroll-btn scroll-end" 
        onClick={scrollToEnd}
        title="Ir al final"
      >
        ↓ 
      </button>
    </div>
  );
};

export default ScrollControls;
