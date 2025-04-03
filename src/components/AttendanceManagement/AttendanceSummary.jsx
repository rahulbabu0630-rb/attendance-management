import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

const AttendanceSummary = () => {
  const { employeeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = location.state || {};

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
  const DEFAULT_PROFILE_ICON = import.meta.env.VITE_DEFAULT_PROFILE_ICON;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || '');
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    halfday: 0,
    halfdaySalary: 0,
    totalSalary: 0,
    monthlySalary: 0
  });
  const [loading, setLoading] = useState({
    employees: true,
    salary: false,
    attendance: false
  });
  const [error, setError] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/all`);
      setEmployees(response.data);
      if (employeeId) setSelectedEmployee(employeeId);
      setLoading(prev => ({ ...prev, employees: false }));
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError('Failed to load employees');
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, [employeeId, API_BASE_URL]);

  const fetchMonthlySalary = useCallback(async () => {
    if (!selectedEmployee) {
      setSummary(prev => ({ ...prev, monthlySalary: 0 }));
      return;
    }

    setLoading(prev => ({ ...prev, salary: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/getById/${selectedEmployee}`);
      setSummary(prev => ({ ...prev, monthlySalary: response.data.salary || 0 }));
      setError('');
    } catch (err) {
      console.error("Error fetching salary:", err);
      const employee = employees.find(e => e.id === selectedEmployee);
      setSummary(prev => ({ ...prev, monthlySalary: employee?.salary || 0 }));
      setError('Failed to load salary data. Using fallback value.');
    } finally {
      setLoading(prev => ({ ...prev, salary: false }));
    }
  }, [selectedEmployee, employees, API_BASE_URL]);

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedEmployee && employeeId) return;

    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      const url = selectedEmployee 
        ? `${API_BASE_URL}/attendance/filter?employeeId=${selectedEmployee}&year=${selectedYear}&month=${selectedMonth}`
        : `${API_BASE_URL}/attendance/filter?year=${selectedYear}&month=${selectedMonth}`;

      const response = await axios.get(url);
      const records = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setAttendanceData(records);
      calculateSummary(records);
      setError('');
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  }, [selectedEmployee, selectedYear, selectedMonth, employeeId, summary.monthlySalary, API_BASE_URL]);

  const calculateSummary = (records) => {
    const calculatedSummary = {
      present: 0,
      absent: 0,
      halfday: 0,
      halfdaySalary: 0,
      totalSalary: 0,
      monthlySalary: summary.monthlySalary
    };

    records.forEach(record => {
      switch(record.status.toLowerCase()) {
        case 'present':
          calculatedSummary.present++;
          calculatedSummary.totalSalary += record.salary;
          break;
        case 'halfday':
          calculatedSummary.halfday++;
          calculatedSummary.halfdaySalary += record.salary;
          calculatedSummary.totalSalary += record.salary;
          break;
        case 'absent':
          calculatedSummary.absent++;
          break;
      }
    });

    setSummary(calculatedSummary);
  };

  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const employee = selectedEmployee 
      ? employees.find(e => e.id === selectedEmployee)
      : null;
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
    
    // Set default styles
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.setFont('helvetica', 'bold');
    doc.text(`${COMPANY_NAME} - Attendance Summary`, 105, 20, { align: 'center' });
    
    // Report info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${monthName} ${selectedYear}`, 15, 30);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 15, 35);
    
    // Employee info box - Only show if viewing specific employee
    if (selectedEmployee && employee) {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(15, 45, 180, 20, 'FD');
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Information:', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`${employee.name} (ID: ${employee.id})`, 60, 55);
    }
    
    // Summary boxes
    const summaryBoxes = [
      { label: 'Present Days', value: summary.present, x: 15, y: selectedEmployee ? 75 : 45 },
      { label: 'Half Days', value: summary.halfday, x: 70, y: selectedEmployee ? 75 : 45 },
      { label: 'Absent Days', value: summary.absent, x: 125, y: selectedEmployee ? 75 : 45 },
      { label: 'Monthly Salary', value: selectedEmployee ? `₹${formatNumber(summary.monthlySalary)}` : 'N/A', x: 15, y: selectedEmployee ? 105 : 75 },
      { label: 'Salary for Half Days', value: `₹${formatNumber(summary.halfdaySalary)}`, x: 70, y: selectedEmployee ? 105 : 75 },
      { label: 'Total Calculated Salary', value: `₹${formatNumber(summary.totalSalary)}`, x: 125, y: selectedEmployee ? 105 : 75 }
    ];
    
    summaryBoxes.forEach(box => {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.rect(box.x, box.y, 50, 25, 'FD');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      doc.text(box.label, box.x + 25, box.y + 8, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(box.value.toString(), box.x + 25, box.y + 16, { align: 'center' });
    });
    
    // Attendance Records Header
    const recordsStartY = selectedEmployee ? 140 : 110;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Attendance Details', 15, recordsStartY);
    
    // Prepare table data
    const headers = ['Date', 'Status', 'Salary (₹)'];
    if (!selectedEmployee) headers.splice(1, 0, 'Employee');
    
    const body = attendanceData.map(record => {
      const row = [
        formatDate(record.date),
        capitalizeFirstLetter(record.status),
        formatNumber(record.salary)
      ];
      if (!selectedEmployee) row.splice(1, 0, record.employeeName);
      return row;
    });
    
    // Simple table implementation
    let yPos = recordsStartY + 10;
    const colWidths = selectedEmployee ? [30, 20, 25] : [25, 50, 20, 25];
    const headerColors = [220, 220, 220];
    
    // Draw table header
    doc.setFillColor(...headerColors);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    let xPos = 20;
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos + 7);
      xPos += colWidths[i];
    });
    
    yPos += 10;
    
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    body.forEach((row, rowIndex) => {
      // Alternate row color
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos, 180, 10, 'F');
      }
      
      xPos = 20;
      row.forEach((cell, cellIndex) => {
        doc.text(cell, xPos, yPos + 7);
        xPos += colWidths[cellIndex];
      });
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 15,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
    
    doc.save(`Attendance_Summary_${employee?.name || 'All'}_${monthName}_${selectedYear}.pdf`);
  };

  const pieData = [
    { name: 'Present', value: summary.present, color: '#4CAF50' },
    { name: 'Half Day', value: summary.halfday, color: '#FFC107' },
    { name: 'Absent', value: summary.absent, color: '#F44336' }
  ];

  const barData = attendanceData
    .map(record => ({
      date: parseInt(record.date.split('T')[0].split('-')[2]),
      present: record.status === 'present' ? 1 : 0,
      halfday: record.status === 'halfday' ? 1 : 0,
      absent: record.status === 'absent' ? 1 : 0,
      employeeName: record.employeeName
    }))
    .sort((a, b) => a.date - b.date)
    .map(item => ({ ...item, date: item.date.toString() }));

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    navigate(empId ? `/attendance-summary/${empId}` : '/attendance-summary', {
      state: { year: selectedYear, month: selectedMonth }
    });
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    navigate(selectedEmployee ? `/attendance-summary/${selectedEmployee}` : '/attendance-summary', {
      state: { year, month: selectedMonth }
    });
  };

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    navigate(selectedEmployee ? `/attendance-summary/${selectedEmployee}` : '/attendance-summary', {
      state: { year: selectedYear, month }
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const loadData = async () => {
      await fetchMonthlySalary();
      await fetchAttendanceData();
    };
    loadData();
  }, [fetchMonthlySalary, fetchAttendanceData]);

  const isLoading = loading.employees || loading.salary || loading.attendance;

  return (
    <div className="container mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-6">Attendance Summary</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              disabled={loading.employees}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} (ID: {emp.id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedYear}
              onChange={handleYearChange}
              disabled={isLoading}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedMonth}
              onChange={handleMonthChange}
              disabled={isLoading}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToPDF}
              disabled={attendanceData.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Error and Loading States */}
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Loading data...</p>
        </div>
      ) : attendanceData.length > 0 ? (
        <>
          {/* Summary Cards */}
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

          {/* Salary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Salary for Half Days</h3>
              <p className="text-xl font-bold text-purple-600">₹{formatNumber(summary.halfdaySalary)}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800">Total Calculated Salary</h3>
              <p className="text-xl font-bold text-indigo-600">₹{formatNumber(summary.totalSalary)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Attendance Distribution</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine="false"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-10">Daily Attendance</h2>
              <BarChart
                width={500}
                height={300}
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    value, 
                    name,
                    props.payload.employeeName ? `Employee: ${props.payload.employeeName}` : ''
                  ]}
                />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#4CAF50" name="Present" />
                <Bar dataKey="halfday" stackId="a" fill="#FFC107" name="Half Day" />
                <Bar dataKey="absent" stackId="a" fill="#F44336" name="Absent" />
              </BarChart>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          No attendance records found for the selected period
        </div>
      )}

      {/* Floating Back Button */}
      <motion.button
        onClick={() => navigate('/attendance')}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full shadow-xl text-white font-medium flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
          transformStyle: 'preserve-3d',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)'
        }}
        whileHover={{ 
          scale: 1.05,
          background: 'linear-gradient(135deg, #4338ca, #7c3aed)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </motion.button>
    </div>
  );
};

export default AttendanceSummary;