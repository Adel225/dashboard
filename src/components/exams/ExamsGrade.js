import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import "../../styles/AssignmentsGrade.css";

const ExamsGrade = () => {
  const { grade } = useParams();

  const [exams, setExams] = useState([
    { title: 'Midterm Exam', submitted: 18, total: 20 },
    { title: 'Final Exam', submitted: 16, total: 20 },
  ]);

  const [students, setStudents] = useState([
    { name: 'Ali Ahmed', status: 'Submitted', grade: 88, notes: 'This was a challenging exam.' },
    { name: 'Sara Hassan', status: 'Not Submitted', grade: null, notes: 'I missed the exam due to illness.' },
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
    <div className="exams-grade-container">
      <h2>Exams for Grade {grade.replace("grade","")}</h2>
      <div className="exams-grade-content">
        <div className="exams-list">
          <h3>Exams</h3>
          <ul>
            {exams.map((exam, index) => (
              <li key={index}>
                <span>{exam.title}</span>
                <span>
                  {exam.submitted}/{exam.total} Submitted
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

export default ExamsGrade;