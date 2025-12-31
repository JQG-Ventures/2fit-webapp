"use client";

import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaClock, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";

interface ExerciseDetailsProps {
    exerciseId: string;
}

const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({ exerciseId }) => {
    const { t } = useTranslation("global");
    const [activeTab, setActiveTab] = useState("resumen");
    const exerciseName = "Test Exercise"
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVideoClick = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false);
        } else {
            videoRef.current.pause();
            setIsPaused(true);
        }
    };

    return (
        <div className="fixed flex flex-col justify-between items-center inset-0 z-50 flex flex-col bg-white p-10">
            {/* Header */}
            <div className="h-[10%] flex flex-row justify-left space-x-8 items-center w-full lg:max-w-3xl">
                <button onClick={() => { }} className="text-gray-700">
                    <FaArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="text-5xl font-semibold">{exerciseName}</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-row w-full justify-between">
                <button
                    className={`px-4 py-6 font-medium ${activeTab === "resumen" ? "border-b-2 border-green-600 text-gray-600" : "text-gray-400"}`}
                    onClick={() => setActiveTab("resumen")}
                >
                    {t("exercise.summary")}
                </button>
                <button
                    className={`px-4 py-6 font-medium ${activeTab === "historia" ? "border-b-2 border-green-600 text-gray-600" : "text-gray-400"}`}
                    onClick={() => setActiveTab("historia")}
                >
                    {t("exercise.history")}
                </button>
                <button
                    className={`px-4 py-6 font-medium ${activeTab === "indicaciones" ? "border-b-2 border-green-600 text-gray-600" : "text-gray-400"}`}
                    onClick={() => setActiveTab("indicaciones")}
                >
                    {t("exercise.instructions")}
                </button>
            </div>

            {/* Content Section */}
            <div className="flex flex-col w-full items-center justify-start flex-1">
                {activeTab === "resumen" && (
                    <div className="w-full h-full max-w-3xl text-center">
                        <div className="relative h-[30%] w-full overflow-hidden">
                            <video
                                ref={videoRef}
                                src="https://2fitcontentstorage.blob.core.windows.net/2fit-content/upright_row.mp4"
                                autoPlay
                                loop
                                muted={isMuted}
                                onClick={handleVideoClick}
                                className="object-cover w-full h-full cursor-pointer"
                            />

                            {/* Play Icon (Shows only when paused) */}
                            {isPaused && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaPlay className="text-white text-4xl bg-black bg-opacity-50 p-4 rounded-full shadow-lg" />
                                </div>
                            )}

                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full shadow-lg hover:bg-opacity-75 transition"
                            >
                                {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
                            </button>
                        </div>

                        <div className="py-10 space-y-2">
                            <p className="text-3xl text-left font-semibold">{exerciseName}</p>
                            <p className="text-xl text-left">Primario: Pecho</p>
                            <p className="text-xl text-left">Secundario: Triceps, Hombros</p>
                        </div>
                        <div className="h-24 mt-4 border border-green-500 flex items-center justify-center">GRÁFICOS</div>
                    </div>
                )}
                {activeTab === "historia" && (
                    <div className="w-full h-full max-w-3xl space-y-6 flex flex-col items-center justify-center text-gray-600">
                        <FaClockRotateLeft className="text-8xl mb-4" />

                        {/* Main Text */}
                        <h2 className="text-3xl font-semibold">{t('exercise.noHistory')}</h2>

                        {/* Subtext */}
                        <p className="text-xl text-gray-400 mt-2 max-w-xs">{t('exercise.noHistoryDesc')}</p>
                    </div>
                )}
                {activeTab === "indicaciones" && (
                    <div className="w-full max-w-3xl h-full items-center space-y-10">
                        <div className="relative h-[30%] w-full overflow-hidden">
                            <video
                                ref={videoRef}
                                src="https://2fitcontentstorage.blob.core.windows.net/2fit-content/upright_row.mp4"
                                autoPlay
                                loop
                                muted={isMuted}
                                onClick={handleVideoClick}
                                className="object-cover w-full h-full cursor-pointer"
                            />

                            {/* Play Icon (Shows only when paused) */}
                            {isPaused && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaPlay className="text-white text-4xl bg-black bg-opacity-50 p-4 rounded-full shadow-lg" />
                                </div>
                            )}

                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full shadow-lg hover:bg-opacity-75 transition"
                            >
                                {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
                            </button>
                        </div>
                        <p className="text-3xl text-left font-semibold">{exerciseName}</p>
                        <ol className="list-decimal space-y-4 pl-6 text-gray-700 text-left mx-8">
                            <li>Acéstate en el bancod das ad asd adassadas dadas sada da  dadas da.</li>
                            <li>Extiende tus brazos y agarra la barra de manera asd sa dd asd auniforme...</li>
                            <li>Lleva tus omóplatos hacia atrás y presiónalos contra el banco.</li>
                            <li>Arquea la parte baja de adsd dasdasda dsada sda a tu espalda...</li>
                            <li>Toma aire, saca la barra sasa dasd as dad adad aad del soporte...</li>
                            <li>Inhala de nuevo y baja la dadas as dad asda da  asd adas adbarra...</li>
                            <li>Mantén por unda sdas da dasd ad momento y presiona la barra hasta que...</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseDetails;