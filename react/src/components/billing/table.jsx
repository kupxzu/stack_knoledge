import React from 'react';

export const Table = ({ children, className = "", ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = "", ...props }) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "", ...props }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableFooter = ({ children, className = "", ...props }) => (
  <tfoot
    className={`border-t bg-gray-100/50 font-medium [&>tr]:last:border-b-0 ${className}`}
    {...props}
  >
    {children}
  </tfoot>
);

export const TableRow = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "", ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className = "", ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);

export const TableCaption = ({ children, className = "", ...props }) => (
  <caption
    className={`mt-4 text-sm text-gray-500 ${className}`}
    {...props}
  >
    {children}
  </caption>
);