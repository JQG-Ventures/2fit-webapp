import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import 'react-circular-progressbar/dist/styles.css';

interface CountdownTimerProps {
    title: string;
    duration: number;
    resetTrigger?: number;
    size: number;
    strockWidth: number;
    onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    title,
    duration,
    resetTrigger,
    size,
    strockWidth,
    onComplete,
}) => {
    const darkerGreenGradientColors = ['#34D399', '#10B981', '#059669', '#047857'];

    return (
        <div className="flex flex-col h-[100%] justify-evenly items-center">
            <div className="h-[5%] items-center">
                <h2 className="text-4xl h-[100%] font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    {title}
                </h2>
            </div>
            <div>
                <CountdownCircleTimer
                    key={resetTrigger}
                    isPlaying
                    duration={duration}
                    size={size}
                    strokeWidth={strockWidth}
                    // @ts-ignore - Skipping type checking for colors
                    colors={darkerGreenGradientColors}
                    trailColor="#E6E6E6"
                    onComplete={() => {
                        onComplete();
                        return { shouldRepeat: false };
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
