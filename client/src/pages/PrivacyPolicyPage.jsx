// src/pages/PrivacyPolicyPage.jsx
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Your privacy is important to us. It is Spacey's policy to respect your privacy regarding any information we may collect from you across our website, [Your Website URL], and other sites we own and operate.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-3">Information We Collect</h2>
            <p className="mb-4">
              We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
            </p>
            <p className="mb-4">
              Log data: When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
            </p>
            <p className="mb-4">
              Device data: We may also collect data about the device you’re using to access our website. This data may include the device type, operating system, unique device identifiers, device settings, and geo-location data. What we collect can depend on the individual settings of your device and software. We recommend checking the policies of your device manufacturer or software provider to learn what information they make available to us.
            </p>
            <p className="mb-4">
              Personal information: We may ask for personal information, such as your: Name, Email, Social media profiles, Date of birth, Phone/mobile number, Home/Mailing address, Work address, Payment information.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Legal Bases for Processing</h2>
            <p className="mb-4">
              We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Security of Your Personal Information</h2>
            <p className="mb-4">
              We retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
            </p>
            <p className="mb-4">
              We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
            </p>

            {/* Add more sections as needed: How We Use Information, Disclosure of Information, International Transfers, Your Rights, Cookies, Business Transfers, Limits of Our Policy, Changes to This Policy, Contact Us etc. */}

            <p className="mt-8">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
