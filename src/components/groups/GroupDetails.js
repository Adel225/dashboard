import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/GroupDetails.css';

const GroupDetails = () => {
  const { grade, group } = useParams(); // Dynamically get grade and group from URL
  const [students, setStudents] = useState([
    { name: 'Ali Ahmed', age: 18, email: 'ali@example.com' },
    { name: 'Sara Hassan', age: 17, email: 'sara@example.com' },
    { name: 'Omar Mohamed', age: 19, email: 'omar@example.com' },
  ]);

  const [studentData, setStudentData] = useState(null); // To store the student to view
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Function to delete a student with confirmation
  const deleteStudent = (studentIndex) => {
    const confirmation = window.confirm(`Are you sure you want to delete ${students[studentIndex].name}?`);
    if (confirmation) {
      const updatedStudents = students.filter((_, index) => index !== studentIndex);
      setStudents(updatedStudents);
    }
  };

  // Function to view a student's details
  const viewStudent = (student) => {
    setStudentData(student);
    setShowStudentModal(true);
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setStudentData(null);
  };

  return (
    <div className="group-details-container">
      <h2>
        Grade {grade.replace("grade","")} - Group {group.replace("group","")}
      </h2>
      <ul>
        {students.map((student, index) => (
          <li key={index} className="student-item">
            <span>{student.name}</span>
            <button className="view-button" onClick={() => viewStudent(student)}>
              View
            </button>
            <button className="delete-button" onClick={() => deleteStudent(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Modal for viewing student details */}
      {showStudentModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Student Details</h3>
            <p>
              <strong>Name:</strong> {studentData.name}
            </p>
            <p>
              <strong>Age:</strong> {studentData.age}
            </p>
            <p>
              <strong>Email:</strong> {studentData.email}
            </p>
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;