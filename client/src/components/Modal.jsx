import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Track count of open modals to handle nested modals
let openModalCount = 0;

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  const scrollBodyRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      openModalCount += 1;

      // Lock background page scroll completely
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';

      window.addEventListener('keydown', handleKeyDown);

      // Auto-focus modal scroll body so cursor wheel scrolls it immediately
      if (scrollBodyRef.current) {
        scrollBodyRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);

        // Only restore page scroll when ALL modals are closed
        if (openModalCount === 0) {
          const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.overflow = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        }
      }
    };
  }, [isOpen, onClose]);

  // Prevent wheel events from bubbling to the background page
  const handleWheelOnOverlay = (e) => {
    // Only prevent if the scroll target is the backdrop (not the modal body)
    if (e.currentTarget === e.target) {
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      style={{ overscrollBehavior: 'none' }}
      onWheel={(e) => {
        // If the wheel event is on the backdrop (not inside the modal), swallow it
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        className={`bg-white w-full ${maxWidth} max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transform transition-all animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 backdrop-blur-md shrink-0">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 
          Scrollable Modal Body
          - overflow-y-auto: enables cursor wheel scrolling inside the modal
          - overscroll-behavior-contain: prevents scroll from leaking to the page beneath
          - tabIndex={0}: makes the div focusable so mouse wheel works immediately
        */}
        <div
          ref={scrollBodyRef}
          tabIndex={0}
          className="p-6 overflow-y-auto flex-1 space-y-6 font-sans select-text outline-none focus:outline-none"
          style={{ overscrollBehavior: 'contain' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
