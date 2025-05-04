'use client';

const SavedMessage: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                {message}
            </div>
        </div>
    );
};

export default SavedMessage;
