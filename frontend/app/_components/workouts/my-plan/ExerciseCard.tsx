import Image from 'next/image';
import { FaCheckCircle, FaFire } from 'react-icons/fa';
import { FiPlayCircle } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { PiNotePencilBold } from 'react-icons/pi';

interface ExerciseCardProps {
    exercise: Exercise;
    onClick: (action: 'details' | 'start') => void;
    isDeleteMode: boolean;
    isOptionalMode: boolean;
    onDeleteSelect: (exerciseId: string) => void;
    onOptionalSelect: (exerciseId: string) => void;
    selectedForDelete: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    onClick,
    isDeleteMode,
    isOptionalMode,
    onDeleteSelect,
    onOptionalSelect,
    selectedForDelete,
}) => (
    <div
        className={`relative bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 ${
            exercise.is_completed || selectedForDelete ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={() => !isDeleteMode && !isOptionalMode && onClick('details')}
    >
        <div className="relative w-full h-40">
            <Image src={exercise.image_url} alt={exercise.name} layout="fill" objectFit="cover" />
            {exercise.is_completed && <div className="absolute inset-0 bg-black opacity-75"></div>}
            {!exercise.is_completed && !isDeleteMode && !isOptionalMode && (
                <button
                    className="absolute inset-0 flex items-center justify-center text-white text-6xl"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick('start');
                    }}
                >
                    <FiPlayCircle />
                </button>
            )}
            {exercise.is_completed && (
                <div className="absolute top-2 left-2 text-green-500 text-2xl">
                    <FaCheckCircle />
                </div>
            )}
            {isDeleteMode && (
                <button
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSelect(exercise.exercise_id!);
                    }}
                >
                    <IoClose size={20} />
                </button>
            )}
            {isOptionalMode && (
                <button
                    className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOptionalSelect(exercise.exercise_id!);
                    }}
                >
                    <PiNotePencilBold size={20} />
                </button>
            )}
        </div>
        <div className="p-3">
            <h3 className="text-md font-semibold">{exercise.name}</h3>
            <p className="text-base font-light flex items-center">
                <FaFire className="text-green-500 mr-1" />
                {exercise.sets} sets x {exercise.reps} reps
            </p>
        </div>
    </div>
);

export default ExerciseCard;
