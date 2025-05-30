import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/header';
import Dashboard from './components/Dashboard';
import Exams from './components/exams/exams';
import Assigments from './components/assignments/Assignments';
import Materials from './components/materials/Materials';
import Groups from './components/groups/Groups';
import GroupDetails from './components/groups/GroupDetails';
import AssignmentsGrade from './components/assignments/AssignmentsGrade';
import ExamsGrade from './components/exams/ExamsGrade';
import StudentSidebar from './components/student/StudentSidebar';
import StudentDashboard from './components/student/StudentDashboard';
import StudentAssignments from './components/student/pages/Assignments';
import StudentExams from './components/student/pages/Exams';
import StudentMaterials from './components/student/pages/Materials';
import Profile from './components/student/pages/Profile';
import TeacherProfile from './components/teacher/Profile';
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <div className="app">
                  <Sidebar />
                  <div className="main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/exams/:grade" element={<ExamsGrade />} />
                      <Route path="/assignments" element={<Assigments />} />
                      <Route path="/assignments/:grade" element={<AssignmentsGrade />} />
                      <Route path="/materials" element={<Materials />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/groups/:grade/:group" element={<GroupDetails />} />
                      <Route path="profile" element={<TeacherProfile />} />
                    </Routes>
                  </div>
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Protected Student Routes */}
        <Route
          path="/student/:studentId/*"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <div className="app">
                  <StudentSidebar />
                  <div className="main-content">
                    <Routes>
                      <Route index element={<StudentDashboard />} />
                      <Route path="assignments" element={<StudentAssignments />} />
                      <Route path="exams" element={<StudentExams />} />
                      <Route path="materials" element={<StudentMaterials />} />
                      <Route path="profile" element={<Profile />} />
                    </Routes>
                  </div>
                </div>
              </>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;