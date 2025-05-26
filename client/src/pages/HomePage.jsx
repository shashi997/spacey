import React from 'react';
import { Link } from 'react-router-dom'; // Make sure react-router-dom is installed
import NavigationBar from '../components/NavigationBar';
import HeroSection from '../components/HeroSection';
import OverviewSection from '../components/OverviewSection';
import CallToActionSection from '../components/CallToActionSection';
import Footer from '../components/Footer';



// --- HomePage Main Component ---
// Orchestrates the different sections of the homepage.
const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <main className="flex-grow">
        <HeroSection />
        <OverviewSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
