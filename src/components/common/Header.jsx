// src/components/common/Header.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scrolling for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Визначення активного пункту меню
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Header active state animation classes
  const headerClasses = `
    sticky top-0 z-50 transition-all duration-300
    ${isScrolled 
      ? "bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-lg" 
      : "bg-white dark:bg-gray-800 shadow-md"}
  `;

  // Navigation items for desktop and mobile
  const navItems = [
    { path: "/", label: "Головна", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { path: "/new-match", label: "Новий матч", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { path: "/history", label: "Історія", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { path: "/statistics", label: "Статистика", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { path: "/help", label: "Допомога", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  // Classes for desktop menu items
  const desktopNavItemClasses = (path) => `
    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
    ${isActive(path)
      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }
  `;

  return (
    <>
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Tennis Tracker
                </h1>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} className={desktopNavItemClasses(item.path)}>
                  {item.label}
                </Link>
              ))}
              <Link to="/help" className="ml-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Bottom mobile navigation - more interesting design */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-2">
        {/* Curved background with blur effect */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg rounded-2xl h-16 border border-gray-200 dark:border-gray-700 flex items-center justify-around">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative w-full flex flex-col items-center justify-center"
              >
                {/* No indicator pill */}
                
                {/* Icon with animated container */}
                <div className={`relative p-1.5 rounded-full transition-all duration-300 ${
                  active 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white transform scale-110 shadow-md" 
                    : "text-gray-500 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
                }`}>
                  {item.icon}
                  
                  {/* No ping effect anymore */}
                </div>
                
                {/* Label */}
                <span className={`text-xs mt-0.5 transition-colors ${
                  active ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Theme toggle button */}
          <button className="group relative w-full flex flex-col items-center justify-center">
            <div className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-700">
              <ThemeToggle isMobile={true} />
            </div>
            <span className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">Тема</span>
          </button>
        </div>
      </nav>
    </>
  );
};
