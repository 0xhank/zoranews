import React from "react";

interface NavigationProps {
  currentPage: string;
  onChangePage: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onChangePage,
}) => {
  const pages = [
    { id: "dashboard", label: "Dashboard" },
    { id: "scraper", label: "Scraper Test" },
  ];

  return (
    <nav className="bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="font-bold text-xl text-white">Zora News</div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onChangePage(page.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === page.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onChangePage(page.id)}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                currentPage === page.id
                  ? "bg-black text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
