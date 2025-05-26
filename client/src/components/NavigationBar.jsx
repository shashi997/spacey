import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { auth } from '../firebaseConfig'; // Import Firebase auth instance
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import auth functions

// --- UserIcon (simple placeholder) ---
const UserIcon = ({ user, onClick }) => {
  const getInitials = (email) => {
    if (!email) return '?';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase();
  };

  return (
    <button
      onClick={onClick}
      className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm focus:outline-none hover:bg-indigo-600 transition-colors"
      aria-label="User menu"
      title={user?.displayName || user?.email}
    >
      {user?.photoURL ? (
        <img src={user.photoURL} alt={user?.displayName || 'User'} className="w-full h-full rounded-full object-cover" />
      ) : (
        getInitials(user?.email)
      )}
    </button>
  );
};


// --- NavigationBar Component ---
const NavigationBar = () => {
  const logoRef = useRef(null);
  const flameContainerRef = useRef(null);
  const flameCoreRef = useRef(null);
  const flameMidRef = useRef(null);
  const dropdownRef = useRef(null); // For detecting outside clicks for user dropdown

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // GSAP Animation Effect
  useEffect(() => {
      const logoElement = logoRef.current;
      const flameContainerElement = flameContainerRef.current;
      const flameCoreElement = flameCoreRef.current;
      const flameMidElement = flameMidRef.current;

      if (!logoElement || !flameContainerElement || !flameCoreElement || !flameMidElement) return;

      const allFlameElements = [flameCoreElement, flameMidElement];

      gsap.set(allFlameElements, {
          opacity: 0,
          scaleX: 0.1,
          scaleY: 0.1,
          transformOrigin: 'left center',
          filter: 'blur(0px)',
          willChange: 'transform, opacity, filter',
      });
      gsap.set(flameCoreElement, { x: 10 });
      gsap.set(flameMidElement, { x: 12 });
      gsap.set(logoElement, { willChange: 'transform' });

      const masterTimeline = gsap.timeline({ paused: true });

      // Recoil animation for the logo
      masterTimeline.to(logoElement, {
          x: -3,
          duration: 0.08,
          ease: 'power2.out',
      }, "ignition")
      .to(logoElement, {
          x: 0,
          duration: 0.2,
          ease: 'elastic.out(1, 0.5)',
      }, "ignition+=0.08");

      // Flame Core Animation
      masterTimeline
          .to(flameCoreElement, {
              opacity: 1, scaleX: 1.2, scaleY: 0.9, duration: 0.08, ease: 'power4.out',
              onStart: () => gsap.set(flameCoreElement, { background: 'linear-gradient(to right, white 0%, rgba(255,255,200,1) 30%, rgba(255,220,100,0.8) 70%, transparent 100%)' }),
          }, "ignition")
          .to(flameCoreElement, {
              scaleX: 0.9, scaleY: 0.7, duration: 0.1, ease: 'power2.in',
              onComplete: () => gsap.set(flameCoreElement, { background: 'linear-gradient(to right, rgba(255,230,180,0.98) 0%, rgba(255,200,100,0.95) 30%, rgba(255,165,0,0.9) 60%, rgba(255,100,0,0.7) 80%, transparent 100%)' }),
          }, "ignition+=0.08")
          .to(flameCoreElement, {
              x: '+=130', scaleX: 2.5, scaleY: 0.5, opacity: 0.9, duration: 0.22, ease: 'power2.inOut',
          }, "thrust")
          .to(flameCoreElement, {
              opacity: () => gsap.utils.random(0.7, 0.95), scaleY: () => gsap.utils.random(0.45, 0.55),
              duration: 0.05, repeat: 3, yoyo: true,
              ease: 'rough({ template: none.out, strength: 1, points: 10, taper: none, randomize: true, clamp: false})'
          }, "thrust+=0.05")
          .to(flameCoreElement, {
              x: '+=80', scaleX: 0.05, scaleY: 0.05, opacity: 0, filter: 'blur(5px)', duration: 0.18, ease: 'power1.in',
          }, "dissipate");

      // Flame Mid Animation
      masterTimeline
          .to(flameMidElement, {
              opacity: 0.8, scaleX: 1.5, scaleY: 1.2, duration: 0.1, ease: 'power3.out',
          }, "ignition+=0.02")
          .to(flameMidElement, {
              scaleX: 1.1, scaleY: 0.9, duration: 0.12, ease: 'power2.in',
          }, "ignition+=0.1")
          .to(flameMidElement, {
              x: '+=120', scaleX: 2.8, scaleY: 0.6, opacity: 0.7, duration: 0.25, ease: 'power2.inOut',
          }, "thrust+=0.03")
          .to(flameMidElement, {
              opacity: () => gsap.utils.random(0.5, 0.75), scaleY: () => gsap.utils.random(0.55, 0.65),
              duration: 0.06, repeat: 2, yoyo: true,
              ease: 'rough({ template: none.out, strength: 1, points: 10, taper: none, randomize: true, clamp: false})'
          }, "thrust+=0.08")
          .to(flameMidElement, {
              x: '+=75', scaleX: 0.1, scaleY: 0.1, opacity: 0, filter: 'blur(8px)', duration: 0.2, ease: 'power1.in',
          }, "dissipate+=0.02");

      masterTimeline.addLabel("ignition", 0);
      masterTimeline.addLabel("thrust", "ignition+=0.15");
      masterTimeline.addLabel("dissipate", "thrust+=0.2");

      const handleMouseEnter = () => {
          gsap.set(allFlameElements, {
              opacity: 0, scaleX: 0.1, scaleY: 0.1, filter: 'blur(0px)',
              willChange: 'transform, opacity, filter',
          });
          gsap.set(flameCoreElement, { x: 10, background: 'linear-gradient(to right, rgba(255,230,180,0.98) 0%, rgba(255,200,100,0.95) 30%, rgba(255,165,0,0.9) 60%, rgba(255,100,0,0.7) 80%, transparent 100%)' });
          gsap.set(flameMidElement, { x: 12 });
          gsap.set(logoElement, { x: 0, willChange: 'transform' });

          masterTimeline.restart();
      };

      logoElement.addEventListener('mouseenter', handleMouseEnter);

      return () => {
          logoElement.removeEventListener('mouseenter', handleMouseEnter);
          masterTimeline.kill();
      };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
               // Check if the click was on the UserIcon itself to prevent immediate re-closing
              const userIconElement = event.target.closest('[aria-label="User menu"]');
              if (!userIconElement) {
                  setIsUserDropdownOpen(false);
              }
          }
      };

      if (isUserDropdownOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      } else {
          document.removeEventListener('mousedown', handleClickOutside);
      }

      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [isUserDropdownOpen]);


  const handleLogout = async () => {
      setIsUserDropdownOpen(false); // Close dropdown
      try {
          await signOut(auth);
          navigate('/'); // Navigate to home page after logout
          // console.log('User logged out successfully');
      } catch (error) {
          console.error('Logout failed:', error);
          // Optionally show an error message to the user
      }
  };

  const toggleUserDropdown = () => {
      setIsUserDropdownOpen(prev => !prev);
  };

  const baseNavLinks = [
    { to: "/lessons", text: "Explore Lessons", className: "font-nunito text-sm md:text-base hover:text-indigo-400 transition-colors duration-150" },
  ];

  const loggedOutSpecificLinks = [
    { to: "/login", text: "Login", className: "font-nunito text-sm md:text-base hover:text-indigo-400 transition-colors duration-150" },
    { to: "/signup", text: "Signup", className: "font-nunito bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150 shadow-md hover:shadow-lg text-sm md:text-base" },
  ];

  const navLinksToRender = currentUser ? baseNavLinks : [...baseNavLinks, ...loggedOutSpecificLinks];

  return (
    <nav
      className="bg-gray-900 text-white p-4 shadow-2xl sticky top-0 z-50"
      style={{
        filter: 'drop-shadow(0 0 12px rgba(129, 140, 248, 0.5)) drop-shadow(0 0 25px rgba(99, 102, 241, 0.4))',
      }}
    >
      <div className="container mx-auto flex justify-between items-center relative">
        <Link
          to="/"
          ref={logoRef}
          className="font-nunito text-2xl font-bold tracking-wider hover:text-indigo-300 transition-colors duration-150 relative z-20 cursor-pointer select-none"
        >
          Spacey
        </Link>

        <div
          ref={flameContainerRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ marginLeft: '80px' }}
        >
          <div
            ref={flameMidRef}
            className="absolute top-1/2 -translate-y-1/2 h-7 w-20 rounded-r-full opacity-70"
            style={{
              background: 'linear-gradient(to right, rgba(255,200,100,0.8) 0%, rgba(255,165,0,0.7) 40%, rgba(255,100,0,0.5) 70%, rgba(200,50,0,0.2) 90%, transparent 100%)',
            }}
          />
          <div
            ref={flameCoreRef}
            className="absolute top-1/2 -translate-y-1/2 h-5 w-16 rounded-r-full"
            style={{
              background: 'linear-gradient(to right, rgba(255,230,180,0.98) 0%, rgba(255,200,100,0.95) 30%, rgba(255,165,0,0.9) 60%, rgba(255,100,0,0.7) 80%, transparent 100%)',
            }}
          />
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          {navLinksToRender.map((link) => (
            <Link
              key={link.to + link.text}
              to={link.to}
              className={link.className}
            >
              {link.text}
            </Link>
          ))}

          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <UserIcon user={currentUser} onClick={toggleUserDropdown} />
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-nunito text-sm text-gray-600">Signed in as</p>
                    <p className="font-nunito text-sm font-medium text-gray-900 truncate" title={currentUser.displayName || currentUser.email}>
                      {currentUser.displayName || currentUser.email}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="font-nunito block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {/* You can add more links like "Account Settings" here */}
                  {/* <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Account Settings
                  </Link> */}
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="font-nunito block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
  
  

export default NavigationBar