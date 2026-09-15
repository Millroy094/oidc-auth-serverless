import { User, Lock, Briefcase, UsersIcon, LogOut } from 'lucide-react';
import * as React from 'react';
import { Suspense, lazy } from 'react';
import { MutatingDots } from 'react-loader-spinner';
import Logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

// Each tab is only rendered when active, so lazy-loading keeps the initial
// Account bundle small and splits Profile/Security/Clients/Users (and their
// heavy dependencies, e.g. MobileNumberInput) into separate chunks.
const Profile = lazy(() => import('./Profile'));
const Security = lazy(() => import('./Security'));
const Clients = lazy(() => import('./Clients'));
const Users = lazy(() => import('./Users'));

const tabFallback = (
  <div className="flex justify-center items-center min-h-[300px]">
    <MutatingDots
      visible
      height="80"
      width="80"
      color="#4fa94d"
      secondaryColor="#4fa94d"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  </div>
);

interface INavItem {
  value: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
  adminOnly?: boolean;
}

export default function Account() {
  const [active, setActive] = React.useState('profile');
  const Auth = useAuth();
  const isAdmin = !!Auth?.user?.roles?.includes('admin');

  const navItems: INavItem[] = [
    { value: 'profile', label: 'Profile', icon: User, content: <Profile /> },
    { value: 'security', label: 'Security', icon: Lock, content: <Security /> },
    {
      value: 'clients',
      label: 'Clients',
      icon: Briefcase,
      content: <Clients />,
      adminOnly: true,
    },
    {
      value: 'users',
      label: 'Users',
      icon: UsersIcon,
      content: <Users />,
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || isAdmin);

  const initials = Auth?.user?.email?.slice(0, 2).toUpperCase() ?? 'MF';
  const activeItem =
    navItems.find((item) => item.value === active) ?? navItems[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8">
              <Logo />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-widest">
              MF Auth
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={Auth?.logout}
            className="gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:hidden"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
        <nav className="grid w-full grid-cols-2 gap-2 md:hidden">
          {navItems.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                active === value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        <aside className="w-64 shrink-0 hidden md:flex flex-col gap-1 rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {Auth?.user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {Auth?.user?.roles?.join(', ') ?? 'User'}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActive(value)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active === value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-2 border-t pt-2">
            <button
              type="button"
              onClick={Auth?.logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 w-full">
          <Suspense fallback={tabFallback}>{activeItem.content}</Suspense>
        </div>
      </div>
    </div>
  );
}
