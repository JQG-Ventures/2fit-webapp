import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import 'react-circular-progressbar/dist/styles.css';

interface CountdownTimerProps {
    title: string;
    duration: number;
    resetTrigger: number;
    size: number;
    strockWidth: number;
    onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ title, duration, resetTrigger, size, strockWidth, onComplete }) => {
    const darkerGreenGradientColors = ['#34D399', '#10B981', '#059669', '#047857'];
    const splitColorsTime = Array.from(
        { length: darkerGreenGradientColors.length },
        (_, i) => Math.round((duration / darkerGreenGradientColors.length) * (darkerGreenGradientColors.length - i))
    );

    return (
        <div className="flex flex-col h-[100%] justify-evenly items-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                {title}
            </h2>
            <div>
                <CountdownCircleTimer
                    key={resetTrigger}
                    isPlaying
                    duration={duration}
                    size={size}
                    strokeWidth={strockWidth}
                    colors={darkerGreenGradientColors}
                    colorsTime={splitColorsTime}
                    trailColor="#E6E6E6"
                    onComplete={() => {
                        onComplete();
                        return { shouldRepeat: false }
                    }}
                >
                    {({ remainingTime }) => (
                        <span className="text-4xl font-bold text-black">{remainingTime}</span>
                    )}
                </CountdownCircleTimer>
            </div>
        </div>
    );
};

export default CountdownTimer;
