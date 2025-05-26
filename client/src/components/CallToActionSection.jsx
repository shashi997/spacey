// --- CallToActionSection Component ---
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Import ScrollTrigger
import { auth } from '../firebaseConfig'; // Import Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth'; // Import auth functions

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Encourages users to take the next step (e.g., sign up, start learning).
const CallToActionSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const paragraphRef = useRef(null);
  const buttonsContainerRef = useRef(null); // Ref for the button container

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To prevent FOUC

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    // Ensure animation runs only after auth state is determined and elements are present
    if (isLoadingAuth || !sectionRef.current || !headingRef.current || !paragraphRef.current || !buttonsContainerRef.current) {
      return;
    }

    const section = sectionRef.current;
    const heading = headingRef.current;
    const paragraph = paragraphRef.current;
    const buttonsContainer = buttonsContainerRef.current;

    // Get the individual link elements inside the buttons div
    // These will be different based on login state, so we query them after they are rendered
    const individualButtons = Array.from(buttonsContainer.children);

    if (individualButtons.length === 0) return; // No buttons to animate

    // Initial hidden state for all elements
    gsap.set([heading, paragraph, ...individualButtons], { opacity: 0, y: 50 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to([heading, paragraph], { // Animate heading and paragraph first
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15, // Slight stagger between heading and paragraph
    })
    .to(individualButtons, { // Then animate the buttons with stagger
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.2, // Stagger between the buttons
      ease: 'back.out(1.2)', // A slight pop effect
    }, "-=0.4"); // Start button animation slightly before heading/paragraph finish


    // ScrollTrigger setup for the timeline
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%', // Adjust start point as needed
      animation: tl, // Link the timeline to the scroll trigger
      toggleActions: 'play none none none', // Play animation once when entering
      // markers: true, // Uncomment for debugging
    });


    // Cleanup function for ScrollTrigger instances
    return () => {
      if (st) st.kill();
      // Kill the timeline as well to prevent issues on re-renders if elements change
      if (tl) tl.kill();
      // Reset properties if needed, though ScrollTrigger usually handles this on kill
      gsap.set([heading, paragraph, ...individualButtons], { clearProps: "all" });
    };

  }, [isLoadingAuth, currentUser]); // Rerun animation logic if auth state changes (and thus buttons change)


  // To prevent flash of unstyled/incorrect content before auth state is known
  if (isLoadingAuth) {
      return (
          <section
              className="py-16 md:py-20 px-4 md:px-6 text-white overflow-hidden relative z-0"
              style={{
                  background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.3) 0%, rgba(79, 70, 229, 0.2) 20%, rgba(30, 27, 49, 0.8) 60%, rgba(15, 10, 30, 0.95) 100%)',
                  backgroundColor: '#312e81',
              }}
          >
              <div className="container mx-auto text-center relative z-10 h-72 flex items-center justify-center">
                  {/* Optional: Add a simple loader here */}
              </div>
          </section>
      );
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 px-4 md:px-6 text-white overflow-hidden relative z-0" // Added overflow-hidden, relative, z-0
      style={{
        // Subtle Radial Gradient Background
        background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.3) 0%, rgba(79, 70, 229, 0.2) 20%, rgba(30, 27, 49, 0.8) 60%, rgba(15, 10, 30, 0.95) 100%)',
        // Fallback background color
        backgroundColor: '#312e81', // Tailwind indigo-800
      }}
    >
      <div className="container mx-auto text-center relative z-10"> {/* Added relative z-10 to keep content above background effect */}
        <h2 ref={headingRef} className="text-3xl md:text-4xl font-bold mb-6 opacity-0"> {/* Initial opacity */}
          Ready to Launch Your Learning Adventure?
        </h2>
        <p ref={paragraphRef} className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-indigo-200 opacity-0"> {/* Initial opacity */}
          {currentUser
            ? "Continue your journey and explore new horizons with Spacey."
            : "Join Spacey today and unlock a universe of knowledge. It's free to get started!"}
        </p>
        <div
          ref={buttonsContainerRef} // Ref for the container div
          className="space-y-4 md:space-y-0 md:space-x-4 lg:space-x-6 flex flex-col md:flex-row justify-center items-center"
        >
          {/* Common Button: Start Learning */}
          <Link
            to="/lessons"
            className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-50 opacity-0" // Added opacity-0 for GSAP
            style={{
              boxShadow: '0 0 15px rgba(250, 204, 21, 0.4), 0 0 25px rgba(250, 204, 21, 0.25)',
            }}
          >
            Start Learning Now
          </Link>

          {currentUser ? (
            // Logged-in user buttons
            <Link
              to="/dashboard"
              className="w-full md:w-auto bg-transparent hover:bg-indigo-800 border-2 border-indigo-300 hover:border-indigo-400 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 opacity-0" // Added opacity-0 for GSAP
            >
              Go to Your Dashboard
            </Link>
          ) : (
            // Logged-out user buttons
            <>
              <Link
                to="/signup"
                className="w-full md:w-auto bg-transparent hover:bg-indigo-800 border-2 border-indigo-300 hover:border-indigo-400 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 opacity-0" // Added opacity-0 for GSAP
              >
                Create an Account
              </Link>
              <Link
                to="/login"
                className="w-full md:w-auto text-indigo-200 hover:text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:ring-opacity-50 opacity-0" // Added opacity-0 for GSAP
              >
                Already have an account? Login
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};


export default CallToActionSection