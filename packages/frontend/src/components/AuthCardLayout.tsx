import { FC, ReactNode } from 'react';

interface AuthCardLayoutProps {
  children: ReactNode;
}

// Shared page shell for the login/register/forgot-password/confirm cards so
// their background, spacing and card styling stay in sync.
const AuthCardLayout: FC<AuthCardLayoutProps> = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    {children}
  </div>
);

export default AuthCardLayout;
