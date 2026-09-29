import { Loader2 } from 'lucide-react';
import { FC } from 'react';

interface TransitionOverlayProps {
  isVisible: boolean;
  message?: string;
}

const TransitionOverlay: FC<TransitionOverlayProps> = ({
  isVisible,
  message = 'Please wait...',
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fadeInImmediate {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .transition-overlay-visible {
          animation: fadeInImmediate 0.15s ease-out forwards;
        }
      `}</style>
      <div className="transition-overlay-visible fixed inset-0 bg-white/97 backdrop-blur-md flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      </div>
    </>
  );
};

export default TransitionOverlay;
