import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const { pathname } = useLocation();
  const fullBleed = pathname.startsWith('/simulador');

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <Header />
        <main className="flex-1 min-h-0 bg-[--color-bg-primary] overflow-hidden">
          {fullBleed ? (
            <Outlet />
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="p-6 max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}