import { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

function DataTable({ columns, data, onSort, sortField, sortOrder, onRowClick }) {
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && (
                  <span className="sort-arrows">
                    <span className={`arrow ${sortField === col.key && sortOrder === 'asc' ? 'active' : ''}`}>
                      <FiChevronUp />
                    </span>
                    <span className={`arrow ${sortField === col.key && sortOrder === 'desc' ? 'active' : ''}`}>
                      <FiChevronDown />
                    </span>
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="empty-state">
                  <div className="empty-state-text">No data available</div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className={onRowClick ? 'clickable-row' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
