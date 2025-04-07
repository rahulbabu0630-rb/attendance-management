import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AboutUs from "./components/AboutUs";
import Gallery from "./components/Gallery";
import AttendancePage from "./components/AttendanceManagement/AttendancePage";
import MarkAttendance from "./components/AttendanceManagement/MarkAttendance";
import AttendanceSummary from "./components/AttendanceSummary/AttendanceSummary";
import EmployeeDirectory from "./components/EmployeeManagement/EmployeeDirectory";
import AddEmployee from "./components/EmployeeManagement/AddEmployee";
import EmployeeProfile from "./components/EmployeeManagement/EmployeeProfile";
import BulkAttendancePage from "./components/BulkManagement/BulkAttendancePage";
import ContactUs from "./components/ContactUs";

const AppContent = () => {
  const location = useLocation();
  
  return (
    <div>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />
        
        {/* Main navigation routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/contact-us" element={<ContactUs />} />
        
        {/* Attendance management routes */}
        <Route path="/mark-attendance/:id" element={<MarkAttendance />} />
        <Route path="/attendance-summary" element={<AttendanceSummary />} />
        <Route path="/attendance-summary/:employeeId" element={<AttendanceSummary />} />
        
        {/* Employee management routes */}
        <Route path="/employee-management" element={<EmployeeDirectory />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/employee-profile/:name" element={<EmployeeProfile />} />
        
        {/* Bulk operations */}
        <Route path="/bulk-attendance" element={<BulkAttendancePage />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;