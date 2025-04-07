import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    salary: '',
    number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  }, []);

  const tick = () => {
    setCurrentTime(new Date());
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Employee name is required', {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'toast-error'
      });
      setIsLoading(false);
      return;
    }

    if (!formData.salary.trim()) {
      toast.error('Salary is required', {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'toast-error'
      });
      setIsLoading(false);
      return;
    }

    // Phone number validation (optional)
    if (formData.number.trim() !== '') {
      const phonePattern = /^[+\-0-9]{1,15}$/;
      if (!phonePattern.test(formData.number.trim())) {
        toast.error('Phone number can contain +, -, or digits (max 15 characters)', {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'toast-error'
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://durgadevisweets.onrender.com';
      
      const response = await fetch(`${apiUrl}/employees/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          salary: parseFloat(formData.salary),
          ...(formData.role.trim() && { role: formData.role.trim() }),
          ...(formData.number.trim() && { number: formData.number.trim() }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific backend error messages
        if (errorData.message.includes("already exists")) {
          throw new Error(errorData.message);
        }
        throw new Error('Failed to add employee. Please try again.');
      }

      toast.success('✅ Employee added successfully!', {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'toast-success'
      });
      
      setFormData({ name: '', role: '', salary: '', number: '' });
      
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = error.message;
      
      if (error.message.includes('Phone number already registered')) {
        errorMessage = 'This phone number is already registered!';
      } else if (error.message.includes('Employee with this name already exists')) {
        errorMessage = 'An employee with this name already exists!';
      } else if (error.message.includes('Invalid phone number format')) {
        errorMessage = 'Invalid phone number format. Please use +, -, or digits (max 15 chars).';
      }
      
      toast.error(`❌ ${errorMessage || 'Server error. Please try again later.'}`, {
        position: "top-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'toast-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPendulumClock = () => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    const hourDegrees = (hours * 30) + (minutes * 0.5);
    const minuteDegrees = minutes * 6;
    const secondDegrees = seconds * 6;
    const pendulumDegrees = Math.sin(Date.now() / 500) * 15;

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const formattedDate = currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div className="fixed top-6 right-6 z-50 flex flex-col items-center">
        {/* Clock Container */}
        <div className="relative w-32 h-48 flex justify-center">
          {/* Clock Body */}
          <div className="relative w-24 h-24 rounded-full bg-amber-900 border-4 border-amber-700 shadow-lg overflow-hidden">
            {/* Clock Face */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Clock Center */}
              <div className="absolute z-10 w-3 h-3 rounded-full bg-gray-800"></div>
              
              {/* Hour Hand */}
              <div 
                className="absolute z-3 w-1 h-6 bg-gray-800 rounded-full origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${hourDegrees}deg)`,
                  top: '50%',
                  left: '50%'
                }}
              ></div>
              
              {/* Minute Hand */}
              <div 
                className="absolute z-2 w-1 h-8 bg-gray-700 rounded-full origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${minuteDegrees}deg)`,
                  top: '50%',
                  left: '50%'
                }}
              ></div>
              
              {/* Second Hand */}
              <div 
                className="absolute z-1 w-0.5 h-10 bg-red-500 rounded-full origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${secondDegrees}deg)`,
                  top: '50%',
                  left: '50%'
                }}
              ></div>
            </div>
          </div>
          
          {/* Pendulum */}
          <div 
            className="absolute top-24 w-1 h-16 bg-amber-800 origin-top"
            style={{ transform: `rotate(${pendulumDegrees}deg)` }}
          >
            <div className="absolute bottom-0 left-1/2 w-6 h-6 rounded-full bg-amber-600 transform -translate-x-1/2"></div>
          </div>
          
          {/* Clock Top */}
          <div className="absolute top-0 w-8 h-4 bg-amber-800 rounded-t-full"></div>
        </div>

        {/* Digital Time */}
        <div className="mt-4 text-center bg-amber-900/90 backdrop-blur-sm rounded-lg p-2 border border-amber-700 shadow">
          <div className="text-md font-mono font-bold text-amber-100">
            {formattedTime}
          </div>
          <div className="text-xs text-amber-200 mt-1">
            {formattedDate}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen">
      <ToastContainer 
        position="top-left"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="toast-message"
      />

      <style>
        {`
          .toast-success {
            background: linear-gradient(to right, #4f46e5, #7c3aed, #ec4899) !important;
            color: white !important;
            font-weight: bold;
            border-radius: 12px !important;
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .toast-error {
            background: linear-gradient(to right, #dc2626, #ea580c, #d97706) !important;
            color: white !important;
            font-weight: bold;
            border-radius: 12px !important;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .Toastify__toast {
            margin-bottom: 0.75rem;
          }
        `}
      </style>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPendulumClock()}

        <header className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 tracking-tight">
            Add New Employee
          </h1>
          <p className="mt-3 text-lg text-purple-200/80 drop-shadow-lg">
            Enter employee details to add to the directory
          </p>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 justify-center">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl p-8 border border-purple-500/40 transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Name Field (Required) */}
                <div className="mb-6">
                  <label htmlFor="name" className="block text-purple-200 text-sm font-semibold mb-2 drop-shadow-md">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter employee name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-400/30 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Role Field (Optional) */}
                <div className="mb-6">
                  <label htmlFor="role" className="block text-purple-200 text-sm font-semibold mb-2 drop-shadow-md">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Enter job title (optional)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-400/30 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Salary Field (Required) */}
                <div className="mb-6">
                  <label htmlFor="salary" className="block text-purple-200 text-sm font-semibold mb-2 drop-shadow-md">
                    Salary <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Enter salary amount"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-400/30 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Phone Number Field (Optional) */}
                <div className="mb-6">
                  <label htmlFor="number" className="block text-purple-200 text-sm font-semibold mb-2 drop-shadow-md">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="e.g., +91-9876543210 (optional)"
                    maxLength="15"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-400/30 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                  <p className="mt-1 text-xs text-purple-300">Optional - Can include country code (max 15 characters)</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 py-4 font-medium transform hover:scale-105 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Employee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Back Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => navigate('/employee-management')}
          className="flex items-center px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-[0_8px_0_0_rgba(6,82,147,0.8)] hover:shadow-[0_4px_0_0_rgba(6,82,147,0.8)] hover:translate-y-1 transition-all duration-200 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
      </div>
    </div>
  );
};

export default AddEmployee;