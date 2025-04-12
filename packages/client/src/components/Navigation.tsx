import React from "react";

interface NavigationProps {
  currentPage: string;
  onChangePage: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onChangePage,
}) => {
  const pages = [{ id: "dashboard", label: "Dashboard" }];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="font-bold text-xl text-gray-900">Zora News</div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onChangePage(page.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                    currentPage === page.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={currentPage === page.id ? "page" : undefined}
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
                  ? "bg-blue-50 text-blue-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-current={currentPage === page.id ? "page" : undefined}
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
