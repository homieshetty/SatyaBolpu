import { ReactNode, useLayoutEffect, useMemo } from 'react';
import { MdDone } from 'react-icons/md';
import { NewState } from '../types/globals';

type PropsType = {
  steps: Record<string, ReactNode>;
  progress: number;
  setProgress: (progress: number) => void;
  setShowStep: (step: string) => void;
  state: NewState;
};

const ProgressBar: React.FC<PropsType> = ({
  steps,
  progress,
  setProgress,
  setShowStep,
  state,
}) => {
  const offset = useMemo(() => 100 / (Object.keys(steps).length - 1), [steps]);

  const allComplete = useMemo(
    () => Object.values(state).every((v) => Boolean(v)),
    [state],
  );

  useLayoutEffect(() => {
    let width = 0;
    for (const value of Object.values(state)) {
      if (!value) {
        break;
      }
      width += offset;
    }

    setProgress(width);
  }, [state]);

  return (
    <>
      <div
        className="w-[80%] sm:w-2/3 md:w-1/3 h-1 bg-white rounded-lg
          flex itemse-center justify-between relative"
      >
        <div
          className="absolute z-10 rounded-lg bg-primary h-1"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        ></div>
        {Object.keys(steps).map((step, index) => {
          const isDisabled = index === 0 ? false : progress < offset * index;
          const isCompleted = allComplete || progress > offset * index;
          return (
            <div
              className={`w-10 h-10 p-2 rounded-full absolute top-1/2 -translate-y-1/2
                  border-3 border-primary z-20 flex items-center justify-center text-white
                  ${isCompleted ? 'bg-primary' : 'bg-black'}
                  ${!isDisabled ? 'hover:border-white hover:bg-primary ' : 'opacity-50'}`}
              key={index}
              onClick={isDisabled ? () => {} : () => setShowStep(step)}
              style={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                left: `${index * offset}%`,
              }}
            >
              {isCompleted ? <MdDone /> : index + 1}
              <div className="absolute bottom-full text-nowrap mb-2">
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProgressBar;
