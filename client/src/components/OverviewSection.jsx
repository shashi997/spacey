// --- OverviewSection Component ---
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Import ScrollTrigger

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Briefly describes the learning experience offered.
const OverviewSection = () => {
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const cardsRef = useRef([]); // Use an array ref for multiple cards
  
    useEffect(() => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const cards = cardsRef.current;
  
      if (!section || !heading || cards.length === 0) return;
  
      // --- Heading Animation ---
      gsap.fromTo(heading,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section, // Trigger when the section enters the viewport
            start: 'top 80%', // Animation starts when the top of the section is 80% down the viewport
            // end: 'bottom 20%', // Optional: animation ends when bottom is 20% up
            toggleActions: 'play none none none', // Play animation once when entering
            // markers: true, // Uncomment for debugging ScrollTrigger start/end points
          },
        }
      );
  
      // --- Cards Staggered Animation ---
      gsap.fromTo(cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2, // Stagger the animation of each card by 0.2 seconds
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section, // Use the same section as the trigger
            start: 'top 70%', // Start slightly later than the heading
            // end: 'bottom 20%',
            toggleActions: 'play none none none',
            // markers: true, // Uncomment for debugging
          },
        }
      );
  
      // Cleanup function for ScrollTrigger instances
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
  
    }, []); // Empty dependency array means this runs once on mount
  
  
    return (
      <section ref={sectionRef} className="py-16 md:py-20 px-4 md:px-6 bg-slate-900 overflow-hidden"> {/* Dark background, overflow hidden */}
        <div className="container mx-auto text-center">
          <h2
            ref={headingRef}
            className="text-3xl md:text-4xl font-bold mb-12 opacity-0" // Initial opacity for GSAP
            style={{
              // Text Gradient
              backgroundImage: 'linear-gradient(to right, #818cf8, #a78bfa, #c4b5fd)', // Tailwind indigo-400 to purple-400 gradient colors
              WebkitBackgroundClip: 'text', // Apply gradient to text
              WebkitTextFillColor: 'transparent', // Make text transparent so gradient shows
              backgroundClip: 'text',
              color: 'transparent', // Fallback for non-webkit browsers
              // Text Glow
              textShadow: '0 0 8px rgba(129, 140, 248, 0.6), 0 0 15px rgba(167, 139, 250, 0.4)', // Subtle glow matching gradient colors
            }}
          >
            What Awaits You at <span className="text-indigo-400">Spacey</span>? {/* Keep span for color variation if desired */}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {/* Card 1 */}
            <div
              ref={el => cardsRef.current[0] = el} // Assign ref to array element
              className="p-6 md:p-8 bg-gray-800 rounded-xl shadow-lg transition-shadow duration-300 opacity-0" // Dark background, initial opacity
              style={{
                // Subtle Glowing Box-Shadow
                boxShadow: '0 0 15px rgba(129, 140, 248, 0.2), 0 0 25px rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.1)', // Subtle border
              }}
            >
              <div className="text-indigo-400 mb-4"> {/* Adjusted icon color for dark background */}
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0A5.002 5.002 0 0112 20a5.002 5.002 0 01-5.002-2.253M15 7.5H9m6 3H9m3 3H9m3 3H9M3 10h.008v.008H3V10z"></path></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-200">Interactive Lessons</h3> {/* Lighter text color */}
              <p className="text-gray-400"> {/* Lighter text color */}
                Engage with dynamic content, simulations, and quizzes that make learning about space fun and effective.
              </p>
            </div>
  
            {/* Card 2 */}
            <div
              ref={el => cardsRef.current[1] = el} // Assign ref
              className="p-6 md:p-8 bg-gray-800 rounded-xl shadow-lg transition-shadow duration-300 opacity-0" // Dark background, initial opacity
               style={{
                boxShadow: '0 0 15px rgba(129, 140, 248, 0.2), 0 0 25px rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.1)',
              }}
            >
              <div className="text-indigo-400 mb-4"> {/* Adjusted icon color */}
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-200">Expert Content</h3> {/* Lighter text color */}
              <p className="text-gray-400"> {/* Lighter text color */}
                Learn from curated materials developed by space enthusiasts and educators, covering a wide range of topics.
              </p>
            </div>
  
            {/* Card 3 */}
            <div
              ref={el => cardsRef.current[2] = el} // Assign ref
              className="p-6 md:p-8 bg-gray-800 rounded-xl shadow-lg transition-shadow duration-300 opacity-0" // Dark background, initial opacity
               style={{
                boxShadow: '0 0 15px rgba(129, 140, 248, 0.2), 0 0 25px rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.1)',
              }}
            >
              <div className="text-indigo-400 mb-4"> {/* Adjusted icon color */}
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-200">Community Focused</h3> {/* Lighter text color */}
              <p className="text-gray-400"> {/* Lighter text color */}
                Connect with fellow learners, share your discoveries, and grow together in our vibrant community (coming soon!).
              </p>
            </div>
          </div>
        </div>
      </section>
    );
};

export default OverviewSection