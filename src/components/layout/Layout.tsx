import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';

export function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const fullBleed =
    pathname.startsWith('/simulador') ||
    pathname.startsWith('/troubleshooting') ||
    pathname.startsWith('/labs/');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full w-full bg-[--color-bg-primary]">
      <Sidebar open={menuOpen} />
      {menuOpen && <div className="nav-backdrop show" onClick={() => setMenuOpen(false)} />}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="relative flex-1 min-h-0 overflow-hidden">
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="glow-orb -top-40 -left-24 h-96 w-[38rem] bg-[--color-accent-blue]/7" />
            <div className="glow-orb -top-32 right-1/4 h-80 w-[30rem] bg-[--color-accent-purple]/5" />
            <div className="glow-orb bottom-0 -right-24 h-96 w-[30rem] bg-[--color-accent-cyan]/5" />
          </div>
          <div className="relative h-full">
            {fullBleed ? (
              <Outlet />
            ) : (
              <div className="h-full overflow-y-auto animate-fade-in-up">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}