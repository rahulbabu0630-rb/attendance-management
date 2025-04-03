import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight, FaHome } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a style object for the animations
const styles = {
  loadingBubbles: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem 0'
  },
  bubbleContainer: {
    display: 'flex',
    gap: '0.5rem'
  },
  bubble: {
    width: '1rem',
    height: '1rem',
    borderRadius: '50%'
  }
};

const AttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const employeesPerPage = 10;
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'Sri Durga Devi Sweets & Bakery';
  const DEFAULT_PROFILE_ICON = import.meta.env.VITE_DEFAULT_PROFILE_ICON || 'https://ui-avatars.com/api/?name=Unknown&background=0077BE&color=fff';

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/employees/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error('Failed to load employees. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const LoadingBubbles = () => (
    <div style={styles.loadingBubbles}>
      <div style={styles.bubbleContainer}>
        <div style={{ ...styles.bubble, backgroundColor: '#0077BE', animation: 'bounce 1s infinite ease-in-out' }}></div>
        <div style={{ ...styles.bubble, backgroundColor: '#00A9E0', animation: 'bounce 1s infinite ease-in-out 150ms' }}></div>
        <div style={{ ...styles.bubble, backgroundColor: '#0077BE', animation: 'bounce 1s infinite ease-in-out 300ms' }}></div>
      </div>
    </div>
  );

  const filteredEmployees = React.useMemo(() => 
    employees.filter(emp => 
      emp.name?.toLowerCase().includes(search.toLowerCase())
    ),
    [employees, search]
  );

  const paginatedEmployees = React.useMemo(() => {
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    return filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  }, [filteredEmployees, currentPage, employeesPerPage]);

  const handleViewReports = (employeeId) => {
    navigate(`/attendance-summary/${employeeId}`);
  };

  const handleLogoClick = () => {
    navigate('/attendance');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Enhanced Navbar */}
      <nav className="bg-[#0077BE] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
            >
              <img 
                className="h-10 w-auto max-h-[40px] mr-2" 
                src="/assets/logo.png" 
                alt="Company Logo"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150x40?text=Logo';
                }}
              />
              <span className="text-xl font-bold text-white tracking-wide whitespace-nowrap">
                {COMPANY_NAME}
              </span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/employee-management" 
                className="text-white hover:bg-[#0066A3] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap"
              >
                Employee Management
              </Link>
              <Link
                to="/bulk-attendance"
                className="text-white hover:bg-[#0066A3] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap"
              >
                Bulk Attendance
              </Link>
              <Link 
                to="/attendance-summary" 
                className="text-white hover:bg-[#0066A3] px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap"
              >
                Attendance Reports
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Attendance
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage employee attendance records
          </p>
        </div>
        
        {/* Search Box */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md transition-all duration-200 hover:shadow-lg">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#0077BE] focus:outline-none transition-all duration-200"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search employees"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Employee Cards - Show loading or content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {isLoading ? (
            <LoadingBubbles />
          ) : paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((emp) => (
              <div 
                key={emp.id} 
                className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 hover:bg-gray-50 transition duration-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="relative">
                    <img
                      src={emp.profileImage || `https://ui-avatars.com/api/?name=${emp.name?.split(' ').join('+')}&background=0077BE&color=fff`}
                      alt={`${emp.name}'s profile`}
                      className="w-12 h-12 rounded-full shadow-sm border-2 border-white transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_ICON;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00A9E0] rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-semibold text-gray-800">{emp.name}</p>
                    <p className="text-gray-500">Role: {emp.role || "N/A"}</p>
                    <p className="text-gray-500">ID: {emp.id}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto justify-center">
                  <Link 
                    to={`/mark-attendance/${emp.id}`} 
                    className="px-4 py-2 bg-[#0077BE] text-white rounded-md hover:bg-[#0066A3] transition-all duration-200 hover:shadow-md text-center whitespace-nowrap"
                  >
                    Mark Attendance
                  </Link>
                  <button 
                    onClick={() => handleViewReports(emp.id)}
                    className="px-4 py-2 bg-[#00A9E0] text-white rounded-md hover:bg-[#0098CA] transition-all duration-200 hover:shadow-md whitespace-nowrap"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              {search ? 'No matching employees found' : 'No employees available'}
            </p>
          )}
        </div>

        {/* Pagination - Only show if not loading */}
        {!isLoading && filteredEmployees.length > employeesPerPage && (
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0077BE] text-white hover:bg-[#0066A3] hover:shadow-md'
              }`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              <FaChevronLeft className="mr-1" /> Prev
            </button>
            <span className="px-4 py-2 font-medium">
              Page {currentPage} of {Math.ceil(filteredEmployees.length / employeesPerPage)}
            </span>
            <button
              className={`px-4 py-2 rounded-md flex items-center transition-all duration-200 ${
                currentPage >= Math.ceil(filteredEmployees.length / employeesPerPage) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0077BE] text-white hover:bg-[#0066A3] hover:shadow-md'
              }`}
              disabled={currentPage >= Math.ceil(filteredEmployees.length / employeesPerPage)}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Back to Home Button - Fixed at bottom right */}
      <button
        onClick={handleBackToHome}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#0077BE] text-white rounded-lg shadow-lg hover:bg-[#0066A3] transition-all duration-200 hover:shadow-xl flex items-center"
        aria-label="Back to home"
      >
        <FaHome className="mr-2" />
        Back to Home
      </button>
    </div>
  );
};

export default AttendancePage;