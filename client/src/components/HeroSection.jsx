// --- HeroSection Component ---
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import CosmicVisual from './CosmicVisual';


// Captures attention with a welcome message and visuals.
const HeroSection = () => {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const paragraphRef = useRef(null);
    const visualContainerRef = useRef(null); 
    const buttonRef = useRef(null);
  
    useEffect(() => {
      if (!titleRef.current || !paragraphRef.current || !visualContainerRef.current || !buttonRef.current) {
          return;
      }
  
      const elementsToAnimate = [
        titleRef.current,
        paragraphRef.current,
        visualContainerRef.current,
        buttonRef.current,
      ];
  
      gsap.set(elementsToAnimate, { 
        opacity: 0, 
        y: 60,
        // Add will-change for the staggered elements
        willChange: 'transform, opacity',
      }); 
      // For the button's filter animation, specifically hint that filter will change
      gsap.set(buttonRef.current, { willChange: 'transform, opacity, filter' });
  
  
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
      tl.to(elementsToAnimate, {
        opacity: 1,
        y: 0,
        duration: 0.9, 
        stagger: 0.28, 
      })
      .to(buttonRef.current, {
          scale: 1.07,
          duration: 0.25,
          ease: 'back.out(1.7)', 
          filter: 'drop-shadow(0 0 12px rgba(165, 180, 252, 0.75)) drop-shadow(0 0 18px rgba(129, 140, 248, 0.55))', 
          yoyo: true,
          repeat: 1,
          delay: 0.2, 
        }, "-=0.25") 
        .set(buttonRef.current, { filter: 'none', delay: 0.15, willChange: 'transform, opacity' }); // Reset will-change for filter
  
  
       gsap.fromTo(heroRef.current, 
          {opacity: 0, willChange: 'opacity'}, // Add will-change for hero section opacity
          {opacity: 1, duration: 1, delay: 0.1, willChange: 'auto'} // Reset will-change after animation
      );
  
  
    }, []);
  
    return (
      <section
        ref={heroRef}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20 md:py-24 px-4 md:px-6 text-center overflow-hidden opacity-0" 
      >
        <div className="container mx-auto">
          <h1
            ref={titleRef}
            className="font-nunito text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight opacity-0"
          >
            Welcome to <span className="text-indigo-400">Spacey</span>
          </h1>
          <p
            ref={paragraphRef}
            className="font-nunito text-lg sm:text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto opacity-0"
          >
            Your ultimate portal to exploring the wonders of the universe.
            Dive into interactive lessons and expand your cosmic knowledge.
          </p>
  
          <div ref={visualContainerRef} className="my-8 md:my-10 opacity-0">
            <CosmicVisual />
          </div>
  
          <Link
            to="/lessons" 
            ref={buttonRef}
            className="font-nunito inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-transform duration-200 ease-in-out transform hover:scale-105 opacity-0 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50"
          >
            Start Your Journey
          </Link>
        </div>
      </section>
    );
  };
  
export default HeroSection