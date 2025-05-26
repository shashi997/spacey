import React, { useRef, useEffect, useState } from 'react';

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please ensure permissions are granted.");
      }
    };

    enableStream();

    // Cleanup: Stop the video stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* The video element will display the webcam feed */}
      {/* 'autoplay' starts the video automatically */}
      {/* 'playsinline' is needed for iOS */}
      {/* 'muted' is often required for autoplay in some browsers */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute the local feed to avoid echo
        className="w-full h-full object-cover rounded-lg" // object-cover to fill the container
      />
      {/* Optional: Add an overlay or border */}
      <div className="absolute inset-0 border-4 border-indigo-500 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default WebcamFeed;