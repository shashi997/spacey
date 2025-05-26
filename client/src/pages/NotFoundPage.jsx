import React from 'react'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <p className="text-2xl text-gray-700 mt-4">Oops! Page Not Found.</p>
        <p className="text-gray-500 mt-2">The page you are looking for does not exist or has been moved.</p>
        <a href="/" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Go Back Home
        </a>
    </div>
  )
}

export default NotFoundPage