import { useEffect } from 'react';
import { useBreadcrumb } from '@context/BreadcrumbContext';

const BreadcrumbWrapper = ({ breadcrumbs, children }) => {
  const { updateBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    updateBreadcrumbs(breadcrumbs);
  }, [breadcrumbs, updateBreadcrumbs]);

  return children;
};

export default BreadcrumbWrapper;