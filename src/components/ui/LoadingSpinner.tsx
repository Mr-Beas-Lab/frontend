import React, { memo, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';
import { cn } from "../../lib/utils";
import { useLoading } from '../../context/LoadingContext';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  text?: string;
  fullScreen?: boolean;
  localLoading?: boolean;
  localText?: string;
}

/**
 * A standardized loading spinner component for consistent UI across the application
 * Uses global loading state by default, but can be overridden with localLoading prop
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 30,
  color = "#30c0f9",
  className,
  text,
  fullScreen = false,
  localLoading,
  localText,
}) => {
  const { isLoading: globalLoading, loadingText: globalText } = useLoading();
  
  const isLoading = localLoading ?? globalLoading;
  const displayText = localText ?? text ?? globalText;

  const spinnerContent = useMemo(() => (
    <>
      <ClipLoader size={size} color={color} />
      {displayText && (
        fullScreen ? (
          <div className="text-md font-medium mt-3">{displayText}</div>
        ) : (
          <span className="text-sm font-medium">{displayText}</span>
        )
      )}
    </>
  ), [size, color, displayText, fullScreen]);

  if (!isLoading) return null;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      {spinnerContent}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 