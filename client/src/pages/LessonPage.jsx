import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore"; // Firestore functions



// Mock data for lessons - this will be pushed to Firestore
// const mockLessons = [
//   {
//     slug: 'build-your-own-satellite',
//     title: 'Build Your Own Satellite',
//     description: 'Learn the fundamentals of satellite design, components, and orbital mechanics. Construct a virtual model of your very own satellite!',
//     imageUrl: 'https://images.unsplash.com/photo-1579227114347-c05c398ea75b?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     slug: 'science-of-spaghettification',
//     title: 'The Science of Spaghettification',
//     description: 'Dive into the extreme gravitational forces near black holes. Understand the fascinating and terrifying phenomenon of spaghettification.',
//     imageUrl: 'https://images.unsplash.com/photo-1628122606540-10903333333c?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     slug: 'whats-new-in-space-exploration',
//     title: 'What’s New in Space Exploration',
//     description: 'Explore the latest missions, discoveries, and technologies pushing the boundaries of humanity\'s reach into the cosmos.',
//     imageUrl: 'https://images.unsplash.com/photo-1543722530-d2c3207906db?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     slug: 'mars-rover-mission',
//     title: 'Mars Rover Mission',
//     description: 'Follow the incredible journey of Mars rovers, from their design and landing to their groundbreaking scientific findings on the Red Planet.',
//     imageUrl: 'https://images.unsplash.com/photo-1620420790074-7e5025e1975e?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     slug: 'zero-gravity',
//     title: 'Zero Gravity',
//     description: 'Experience the physics and physiology of living in microgravity. Understand how astronauts adapt to life without the pull of Earth.',
//     imageUrl: 'https://images.unsplash.com/photo-1541870633100-fd361138b34f?auto=format&fit=crop&q=80&w=1770&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
// ];



const LessonCard = ({ lesson }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <img
        className="w-full h-48 object-cover"
        src={lesson.imageUrl || 'https://via.placeholder.com/400x250?text=Space+Lesson'}
        alt={lesson.title}
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{lesson.title}</h3>
        <p className="text-gray-600 text-sm mb-4 h-20 overflow-hidden">
          {lesson.description}
        </p>
        {(lesson.difficulty || lesson.duration) && ( // Conditionally render this div
          <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
            {lesson.difficulty && <span>Difficulty: {lesson.difficulty}</span>}
            {lesson.duration && <span>Duration: {lesson.duration}</span>}
          </div>
        )}
        <Link
          to={`/learn/${lesson.slug}`}
          className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Start Lesson
        </Link>
      </div>
    </div>
  );
};



const LessonPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingLessons, setIsAddingLessons] = useState(false);


  // --- TEMPORARY FUNCTION TO ADD MOCK LESSONS TO FIRESTORE ---
  // Call this once by clicking the button, then comment out/remove the button and this function.

  // const handleAddMockLessonsToFirestore = async () => {
  //   if (!window.confirm("Are you sure you want to add all mock lessons to Firestore? This is a one-time setup action and should only be done once.")) {
  //     return;
  //   }
  //   setIsAddingLessons(true);
  //   setError(null);
  //   try {
  //     const lessonsCollectionRef = collection(db, "lessons");
  //     let lessonsAddedCount = 0;
  //     for (const lesson of mockLessons) {
  //       // Prepare lesson data for Firestore
  //       const lessonData = {
  //         slug: lesson.slug,
  //         title: lesson.title,
  //         description: lesson.description,
  //         imageUrl: lesson.imageUrl, // Storing the URL as requested for "image"
  //         // difficulty: lesson.difficulty,
  //         // duration: lesson.duration,
  //         createdAt: serverTimestamp() // Optional: add a timestamp
  //       };
  //       await addDoc(lessonsCollectionRef, lessonData);
  //       lessonsAddedCount++;
  //       console.log(`Added lesson to Firestore: ${lesson.title}`);
  //     }
  //     alert(`${lessonsAddedCount} mock lessons added to Firestore successfully! You can now comment out the 'Add Mock Lessons' button and function.`);
  //     // Optionally, re-fetch lessons to show them immediately
  //     // fetchLessonsFromFirestore(); 
  //   } catch (e) {
  //     console.error("Error adding mock lessons to Firestore:", e);
  //     setError("Failed to add mock lessons. Check console for details.");
  //     alert(`Error adding lessons: ${e.message}`);
  //   } finally {
  //     setIsAddingLessons(false);
  //   }
  // };

  // --- END OF TEMPORARY FUNCTION ---


  const fetchLessonsFromFirestore = async () => {
    setLoading(true);
    setError(null);
    try {
      const lessonsCollectionRef = collection(db, "lessons");
      // You can order by 'createdAt' or 'title', for example
      const q = query(lessonsCollectionRef, orderBy("createdAt", "desc")); // or orderBy("title")
      
      const querySnapshot = await getDocs(q);
      const fetchedLessons = [];
      querySnapshot.forEach((doc) => {
        fetchedLessons.push({ id: doc.id, ...doc.data() });
      });
      setLessons(fetchedLessons);

    } catch (e) {
      console.error("Failed to fetch lessons from Firestore:", e);
      setError("Failed to load lessons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonsFromFirestore();
  }, []); // Empty dependency array means this effect runs once on mount


  if (loading && lessons.length === 0) { // Show loading only if lessons aren't already there
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-700">Loading lessons...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 md:mb-12 text-center">
          Explore Our Cosmic Lessons
        </h1>

        {/* --- TEMPORARY BUTTON TO ADD LESSONS --- */}
        {/* Remove or comment this out after you've successfully added lessons to Firestore */}

        {/* <div className="text-center mb-8">
          <button
            onClick={handleAddMockLessonsToFirestore}
            disabled={isAddingLessons || loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isAddingLessons ? 'Adding Lessons to Firestore...' : 'DEV: Add Mock Lessons to Firestore (One-Time)'}
          </button>
          {isAddingLessons && <p className="text-sm text-gray-600 mt-2">Please wait...</p>}
        </div> */}

        {/* --- END OF TEMPORARY BUTTON --- */}


        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {lessons.map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          !loading && ( // Only show "No lessons" if not loading
            <p className="text-center text-gray-600 text-lg">
              No lessons available at the moment. Check back soon!
            </p>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}


export default LessonPage