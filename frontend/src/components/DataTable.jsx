import React from 'react';
export const DataTable = ({ columns, data }) => {
  return (
    <table className="w-full border-separate border-spacing-2">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className={`border border-slate-600 rounded-md ${col.className || ''}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr className="h-8 hover:bg-amber-100" key={row._id || rowIndex}>
            {columns.map((col, colIndex) => (
              <td key={colIndex} className="border border-slate-700 rounded-md text-center">
                {col.render ? col.render(row, rowIndex) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
