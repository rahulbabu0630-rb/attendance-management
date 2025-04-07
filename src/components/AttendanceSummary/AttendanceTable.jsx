import React from 'react';

const AttendanceTable = ({ 
  attendanceData, 
  selectedEmployee, 
  formatDate, 
  formatNumber, 
  capitalizeFirstLetter 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <h2 className="text-lg font-semibold p-4 border-b">Daily Attendance Details</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {!selectedEmployee && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(record.date)}</td>
                {!selectedEmployee && (
                  <td className="px-6 py-4 whitespace-nowrap">{record.employeeName}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                    record.status === 'halfday' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {capitalizeFirstLetter(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">₹{formatNumber(record.salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;