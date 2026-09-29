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
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in"
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default TransitionOverlay;
