'use client';

const ExerciseList: React.FC<{ exercises: Exercise[], isMobile: boolean }> = ({ exercises, isMobile }) => (
    <div className={isMobile ? 'pb-[13vh]' : ''}>
        <div className="no-scrollbar p-8 lg:max-w-screen-lg mx-auto"> {/* Added mx-auto for centering */}
            {exercises.map((exercise) => (
                <div key={exercise._id} className="flex items-center justify-between my-5 bg-white rounded-3xl shadow-lg h-[13vh]">
                    <div className="w-[30%] h-full overflow-hidden rounded-tl-lg rounded-bl-lg">
                        <img
                            src={exercise.image_url}
                            alt={exercise.name}
                            className="object-cover h-full w-full"
                        />
                    </div>
                    <div className="w-[70%] text-left ml-6">
                        <h3 className="text-black text-4xl font-semibold mb-8">{exercise.name}</h3>
                        <p className="text-gray-700">{exercise.sets} sets x {exercise.reps} reps</p>
                        <p className="text-gray-500">Rest: {exercise.rest} seconds</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ExerciseList;
