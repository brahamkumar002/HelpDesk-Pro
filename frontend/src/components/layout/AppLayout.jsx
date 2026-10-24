
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout() {
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const menuWasOpenRef = useRef(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  // Close the drawer using the Escape key.
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Move keyboard focus into the drawer when it opens.
  useEffect(() => {
    if (isMobileMenuOpen) {
      const firstLink = mobileMenuRef.current?.querySelector('a');

      firstLink?.focus();
    }
  }, [isMobileMenuOpen]);

  // Keep track of whether the drawer was previously open.
  useEffect(() => {
    menuWasOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-border-soft bg-white lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            onClick={closeMobileMenu}
            className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-[3px]"
            aria-label="Close navigation menu"
            tabIndex={-1}
          />

          {/* Drawer */}
          <div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="animate-enter relative z-10 h-full w-[min(310px,88vw)] overflow-hidden border-r border-border-soft bg-white shadow-2xl"
          >
            <Sidebar
              showCloseButton
              onClose={closeMobileMenu}
              onNavigate={closeMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Main Application Area */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[270px]">
        <Header onMenuClick={openMobileMenu} />

        {/* Page Content */}
        <main
          id="main-content"
          className="min-w-0 flex-1"
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
