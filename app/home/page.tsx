import React from 'react';

const HomeScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Header Section */}
            <header className="flex flex-col">
                <h1 className="text-2xl font-bold">Good Morning 👋</h1>
                <h2 className="text-xl mt-1">Pramuditya Uzumaki</h2>
            </header>

            {/* Search Bar */}
            <div className="mt-4">
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full p-2 rounded-lg border border-gray-300"
                />
            </div>

            {/* Highlighted Workout */}
            <div className="mt-6 relative">
                <img 
                    src="/path/to/highlighted-workout.jpg" 
                    alt="Strength & Stretch For Runners" 
                    className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-4 text-white">
                    <h3 className="text-lg font-bold">Strength & Stretch For Runners.</h3>
                    <button className="mt-2 bg-green-500 text-sm px-4 py-2 rounded-lg">See more</button>
                </div>
            </div>

            {/* Today Plan */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Today Plan</h3>

                {/* Card 1 */}
                <div className="relative mb-4">
                    <img 
                        src="/path/to/strength-card.jpg" 
                        alt="Strength and Conditioning Circuit" 
                        className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-4 text-white">
                        <h4 className="text-lg font-bold">Strength and Conditioning Circuit</h4>
                        <div className="flex items-center mt-2">
                            <button className="bg-white text-black text-sm px-4 py-2 rounded-full mr-2">
                                💚
                            </button>
                            <span className="bg-black text-white text-sm px-4 py-2 rounded-full">2</span>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="relative">
                    <img 
                        src="/path/to/hiit-card.jpg" 
                        alt="High Intensity Interval Training" 
                        className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-4 text-white">
                        <h4 className="text-lg font-bold">High Intensity Interval Training</h4>
                        <div className="flex items-center mt-2">
                            <button className="bg-white text-black text-sm px-4 py-2 rounded-full mr-2">
                                💚
                            </button>
                            <span className="bg-black text-white text-sm px-4 py-2 rounded-full">2</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;
