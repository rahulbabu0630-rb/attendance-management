import React from 'react';

const SummaryCards = ({ summary, selectedEmployee, formatNumber }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <h3 className="text-sm font-medium text-green-800">Present Days</h3>
        <p className="text-2xl font-bold text-green-600">{summary.present}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <h3 className="text-sm font-medium text-yellow-800">Half Days</h3>
        <p className="text-2xl font-bold text-yellow-600">{summary.halfday}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <h3 className="text-sm font-medium text-red-800">Absent Days</h3>
        <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800">Monthly Salary</h3>
        <p className="text-2xl font-bold text-blue-600">
          {selectedEmployee ? `₹${formatNumber(summary.monthlySalary)}` : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;