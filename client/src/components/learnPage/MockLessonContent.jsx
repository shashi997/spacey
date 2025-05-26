// MockLessonContent.jsx
import React from 'react';

const MockLessonContent = () => {
  const mockLessonContent = {
    'build-your-own-satellite': {
      title: 'Build Your Own Satellite',
      description: 'Learn the basics of satellite components, orbits, and their functions.', // Added for lessonContextForAI
      sections: [
        {
          id: 'sat_intro_1', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_1.mp3',
          text: `Hello there, space explorers! Have you ever looked up at the night sky and wondered about all the amazing things orbiting our Earth? Well, many of those are satellites – incredible machines that help us do everything from watching our favorite shows to predicting the weather, and even exploring distant planets! Today, we're going to embark on a thrilling mission: building your very own virtual satellite!`,
        },
        {
          id: 'sat_what_is_2', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_2.mp3',
          text: `So, what exactly is a satellite? Simply put, it's any object that orbits another object in space. The Moon is Earth's natural satellite, and the International Space Station is an artificial one. We build artificial satellites for all sorts of jobs! Think of them as super-smart helpers floating high above us. They don't just stay put, though. They whiz around our planet super fast, staying in what we call an 'orbit'.`,
        },
        {
          id: 'sat_parts_bus_3', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_3.mp3',
          text: `Now, let's look inside! Every satellite needs a few key parts, just like a car needs an engine and wheels. First, there's the Bus – that's like the body or frame of our satellite. It holds everything together and protects the important equipment.`,
        },
        {
          id: 'sat_parts_power_4', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_4.mp3',
          text: `Then, we need Power! Most satellites get their energy from the Sun using big, flat Solar Panels. They're like wings that capture sunlight and turn it into electricity.`,
        },
        {
          id: 'sat_parts_comms_sensors_5', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_5.mp3',
          text: `Our satellite also needs to Communicate. That's where Antennas come in! They send and receive signals, letting our satellite talk to Earth, or even to other satellites. Think of them as the satellite's ears and mouth! And for seeing and observing, many satellites have special Sensors or Cameras. These are the eyes of our satellite, gathering all the incredible data about Earth, other planets, or even distant stars.`,
        },
        {
          id: 'sat_orbit_mechanics_6', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_6.mp3',
          text: `Now, for the cool part: how do satellites stay in space without falling down? It's all about Orbital Mechanics! Imagine throwing a ball so fast and so far that it never comes back down, but keeps falling around the Earth. That's essentially what a satellite does!`,
        },
        {
          id: 'sat_orbit_balance_7', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_7.mp3',
          text: `It launches to a certain height, then gets a huge push sideways. Gravity is constantly trying to pull it back to Earth, but the satellite is moving so fast horizontally that it keeps missing the Earth as it falls. This perfect balance between its speed and Earth's gravity creates a stable orbit.`,
        },
        {
          id: 'sat_orbit_types_8', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_8.mp3',
          text: `There are different types of orbits, too! Some satellites are in Low Earth Orbit (LEO), just a few hundred kilometers up, perfect for observing Earth or for astronauts on the International Space Station. Others are in Geosynchronous Orbit (GEO), much higher up, where they stay fixed over the same spot on Earth, which is perfect for communication satellites like those for TV!`,
        },
        {
          id: 'sat_mission_9', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_9.mp3',
          text: `So, when you build your virtual satellite, think about its mission! Is it a weather satellite? A communication satellite? Or maybe one that studies black holes? You'll assemble its bus, attach solar panels for power, add antennas for communication, and choose the right sensors for its job.`,
        },
        {
          id: 'sat_fun_fact_1_10', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_10.mp3',
          text: `Fun Fact 1: The very first artificial satellite was Sputnik 1, launched by the Soviet Union in 1957. It was basically a metal sphere with four antennas and just beeped!`,
        },
        {
          id: 'sat_fun_fact_3_11', // Added ID (assuming Fun Fact 2 was skipped or is elsewhere)
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_11.mp3',
          text: `Fun Fact 3: Satellites move incredibly fast – a satellite in Low Earth Orbit can zip around our entire planet in about 90 minutes! That's like watching 16 sunrises and sunsets every single day!`,
        },
        {
          id: 'sat_conclusion_12', // Added ID
          type: 'audioText',
          audioPath: 'audios/build_your_own_satellite/satellite_12.mp3',
          text: `Designing a satellite combines engineering, physics, and a whole lot of imagination! It's how we reach out and learn more about our amazing universe. So, what will your satellite discover? Let's get building!`,
        },
      ],
    },
    'science-of-spaghettification': {
      title: 'The Science of Spaghettification',
      description: 'Explore the extreme gravitational effects near a black hole.', // Added for lessonContextForAI
      sections: [
        {
          id: 'spag_intro_1', // Added ID
          type: 'text',
          content: 'Prepare to delve into the extreme physics of black holes and the bizarre phenomenon known as spaghettification!',
          speak: true,
        },
        // ... more sections with unique IDs
      ],
    },
    // ... other lessons with unique IDs for their sections
  };

  return mockLessonContent;
};

export default MockLessonContent;
