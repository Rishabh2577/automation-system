import React, { useState, useRef, useEffect } from 'react';

interface UserMenuProps {
  userInfo: {
    name: string;
    email: string;
    picture?: string;
  };
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ userInfo, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  // Get initials from name for fallback avatar
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black overflow-hidden"
      >
        {userInfo.picture ? (
          <img 
            src={userInfo.picture} 
            alt={userInfo.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(userInfo.name)}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 mt-2 w-56 sm:w-64 glass rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Section */}
          <div className="p-3 sm:p-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {userInfo.picture ? (
                <img 
                  src={userInfo.picture} 
                  alt={userInfo.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                  {getInitials(userInfo.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm truncate">
                  {userInfo.name}
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs truncate">
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-1.5 sm:p-2">
            <button
              onClick={handleLogoutClick}
              role="menuitem"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

