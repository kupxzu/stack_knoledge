import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '@context/BreadcrumbContext';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ className = '' }) => {
  const { breadcrumbs } = useBreadcrumb();
  const navigate = useNavigate();

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path || index} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
          )}
          <button
            onClick={() => navigate(crumb.path)}
            className={`
              px-2 py-1 rounded-md transition-colors duration-200
              ${crumb.isActive 
                ? 'text-green-700 font-semibold bg-green-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
              ${crumb.isHome ? 'flex items-center' : ''}
            `}
          >
            {crumb.isHome && <HomeIcon className="w-4 h-4 mr-1" />}
            {crumb.label}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;