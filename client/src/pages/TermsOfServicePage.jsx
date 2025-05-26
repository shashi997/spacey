// src/pages/TermsOfServicePage.jsx
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';

const TermsOfServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Welcome to Spacey! These terms and conditions outline the rules and regulations for the use of Spacey's Website, located at [Your Website URL].
            </p>
            <p className="mb-4">
              By accessing this website we assume you accept these terms and conditions. Do not continue to use Spacey if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Cookies</h2>
            <p className="mb-4">
              We employ the use of cookies. By accessing Spacey, you agreed to use cookies in agreement with the Spacey's Privacy Policy. Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">License</h2>
            <p className="mb-4">
              Unless otherwise stated, Spacey and/or its licensors own the intellectual property rights for all material on Spacey. All intellectual property rights are reserved. You may access this from Spacey for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <p className="mb-4">You must not:</p>
            <ul className="list-disc list-inside mb-4 pl-4">
              <li>Republish material from Spacey</li>
              <li>Sell, rent or sub-license material from Spacey</li>
              <li>Reproduce, duplicate or copy material from Spacey</li>
              <li>Redistribute content from Spacey</li>
            </ul>
            <p className="mb-4">This Agreement shall begin on the date hereof.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">User Comments</h2>
            <p className="mb-4">
              Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Spacey does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Spacey,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, Spacey shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
            </p>
            <p className="mb-4">
              Spacey reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.
            </p>
            {/* Add more sections as needed: Hyperlinking, iFrames, Content Liability, Your Privacy, Reservation of Rights, Removal of links, Disclaimer etc. */}
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

export default TermsOfServicePage;
