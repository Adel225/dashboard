import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import "../../styles/AssignmentsGrade.css";

const AssignmentsGrade = () => {
  const { grade } = useParams(); // Get grade dynamically from URL

  const [assignments, setAssignments] = useState([
    { title: 'Assignment 1 : ', submitted: 15, total: 20 },
    { title: 'Assignment 2 : ', submitted: 12, total: 20 },
  ]);

  const [students, setStudents] = useState([
    { name: 'Ali Ahmed', status: 'Submitted', grade: 95, notes: 'i did not solve the second question' },
    { name: 'Sara Hassan', status: 'Not Submitted', grade: null, notes: '' },
  ]);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleViewNotes = (notes) => {
    setSelectedNotes(notes);
    setShowNotesModal(true);
  };

  const closeModal = () => {
    setShowNotesModal(false);
  };


  return (
    <div className="assignments-grade-container">
      <h2>Assignments for Grade {grade.replace("grade","")}</h2>
      <div className="assignments-grade-content">
        <div className="assignments-list">
          <h3>Assignments</h3>
          <ul>
            {assignments.map((assignment, index) => (
              <li key={index}>
                <span>{assignment.title}</span>
                <span>
                  {assignment.submitted}/{assignment.total} Submitted
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="students-list">
          <h3>Students</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.status}</td>
                  <td>{student.grade || 'N/A'}</td>
                  <td>
                    <button className='notes' onClick={() => handleViewNotes(student.notes)}>View Notes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNotesModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Student Notes</h3>
            <p>{selectedNotes}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsGrade;