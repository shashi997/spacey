// --- Footer Component ---
import React from 'react'
import { Link } from 'react-router-dom';

// Contains copyright information and potentially other links.
const Footer = () => {
    return (
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-10 px-4 md:px-6 text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Spacey. All rights reserved.</p>
          <p className="mt-2 text-sm">Exploring the cosmos, one lesson at a time.</p>
          <div className="mt-4 space-x-4">
              {/* Add actual links if you have these pages */}
              <Link to="/privacy-policy" className="hover:text-indigo-400 text-sm">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-indigo-400 text-sm">Terms of Service</Link>
          </div>
        </div>
      </footer>
    );
}

export default Footer