import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaUserCircle, FaArrowUp, FaArrowDown, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BulkAttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); 
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const showToast = (type, message) => {
    const toastConfig = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: `toast-${type} animate__animated animate__fadeInRight`,
      style: {
        background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
        color: '#fff',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        margin: '10px',
        width: 'auto',
        minWidth: '300px'
      }
    };

    switch(type) {
      case 'success':
        toast.success(message, toastConfig);
        break;
      case 'warning':
        toast.warning(message, toastConfig);
        break;
      case 'error':
        toast.error(message, toastConfig);
        break;
      case 'info':
        toast.info(message, toastConfig);
        break;
      default:
        toast(message, toastConfig);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toString().includes(search)
    );
  }, [employees, search]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/employees/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        showToast('error', 'Failed to load employees. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const markBulkAttendance = async () => {
    if (!selectedStatus) {
      showToast('error', 'Please select attendance status');
      return;
    }

    if (selectedEmployees.length === 0) {
      showToast('error', 'Please select at least one employee');
      return;
    }

    if (selectedDate > today) {
      showToast('error', 'Cannot mark attendance for future dates');
      return;
    }

    try {
      setIsMarking(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bulk-attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          status: selectedStatus,
          date: selectedDate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark attendance');
      }
      
      const successMessages = {
        present: `Successfully marked ${selectedEmployees.length} employees as Present`,
        absent: `Marked ${selectedEmployees.length} employees as Absent`,
        halfday: `Marked ${selectedEmployees.length} employees as Half Day`
      };
      
      showToast('success', successMessages[selectedStatus]);
      setSelectedEmployees([]);

    } catch (error) {
      showToast('error', error.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setIsMarking(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/attendance');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const statusColors = {
    present: "bg-purple-100 text-purple-800",
    absent: "bg-pink-100 text-pink-800",
    halfday: "bg-indigo-100 text-indigo-800"
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="animate__animated animate__fadeIn"
      />
      
      {/* Fixed Header with absolute positioning */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title - absolutely positioned left */}
            <div className="absolute left-4 flex items-center">
              <div 
                className="flex items-center cursor-pointer group"
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
              >
                <img 
                  className="h-10 w-auto max-h-[40px] transform transition-all duration-300 group-hover:scale-110"
                  src="/assets/logo.png" 
                  alt="Company Logo"
                  style={{
                    maxWidth: '150px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x40?text=Logo';
                    e.target.className = 'h-10 w-auto max-h-[40px]';
                  }}
                />
                <span className="ml-2 text-xl font-bold text-white tracking-wide group-hover:text-opacity-80 transition-all duration-300">
                  {import.meta.env.VITE_COMPANY_NAME}
                </span>
              </div>
            </div>

            {/* Nav items - absolutely positioned right */}
            <div className="absolute right-4 flex items-center space-x-4">
              <button 
                onClick={() => navigate('/attendance')}
                className="flex items-center px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <FaArrowLeft className="mr-1" />
                <span className="text-sm">Back to Attendance</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <button 
        onClick={scrollToBottom}
        className="fixed top-20 left-6 z-50 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110"
      >
        <FaArrowDown />
      </button>

      {/* Main content with padding to account for fixed header */}
      <div className="pt-24 max-w-6xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-purple-900 text-center mb-6 uppercase tracking-wide">
          Single Click Attendance
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-purple-600 text-4xl mb-4" />
              <p className="text-purple-700 text-lg font-medium">Loading employees...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-4 text-purple-400 text-lg" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input 
                  type="date" 
                  className="border border-purple-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 bg-white text-lg"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-5">
                <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
                  <select 
                    className="border border-purple-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 w-full sm:w-auto text-lg"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="halfday">Half Day</option>
                  </select>
                  <button 
                    onClick={markBulkAttendance}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-lg flex items-center justify-center min-w-[180px]"
                    disabled={!selectedStatus || selectedEmployees.length === 0 || isMarking}
                  >
                    {isMarking ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Mark Attendance"
                    )}
                  </button>
                </div>
                <div className="text-lg text-purple-700 font-medium">
                  {selectedEmployees.length} employees selected
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-medium text-purple-800 uppercase tracking-wider">
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 transition-all duration-300"
                          checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-purple-800 uppercase tracking-wider">Employee ID</th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-purple-800 uppercase tracking-wider">Name</th>
                      <th className="px-8 py-4 text-left text-sm font-medium text-purple-800 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-purple-100">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-purple-50 transition-colors duration-300">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 transition-all duration-300"
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={() => handleEmployeeSelect(emp.id)}
                            />
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-lg text-purple-900 font-medium">{emp.id}</td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              {emp.profileImage ? (
                                <img
                                  src={emp.profileImage}
                                  alt="Profile"
                                  className="w-10 h-10 rounded-full mr-4 shadow-sm border-2 border-purple-200 transform transition-all duration-300 hover:scale-110"
                                />
                              ) : (
                                <FaUserCircle className="w-10 h-10 rounded-full mr-4 text-purple-400" />
                              )}
                              <div>
                                <div className="text-lg font-medium text-purple-900">{emp.name}</div>
                                <div className="text-base text-purple-500">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-lg">
                            {selectedStatus && selectedEmployees.includes(emp.id) ? (
                              <span className={`px-3 py-2 text-sm font-semibold rounded-full ${statusColors[selectedStatus]}`}>
                                {selectedStatus}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-lg text-purple-500">
                          No employees found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <button 
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110"
      >
        <FaArrowUp className="text-lg" />
      </button>
    </div>
  );
};

export default BulkAttendancePage;