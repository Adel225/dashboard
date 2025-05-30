import React, { useState, useEffect } from 'react';
import '../../../styles/assignments.css';
import { NavLink } from 'react-router-dom';

const Assigments = () => {

  // Example dynamic data (can be replaced with an API call)
  // useEffect(() => {
  //   const data = [
  //     { grade: "Grade 12", count: 2 },
  //     { grade: "Grade 11", count: 1 },
  //     { grade: "Grade 10", count: 3 },
  //     { grade: "Grade 9", count: 1 },
  //   ];
  //   setAssignmentData(data);
  // }, []);
  const assignments = [1, 2, 3, 4];

  const assignmentsFromAdmin = [
    "Assignment 1: unit 1",
    "Assignment 2: unit 2",
    "Assignment 3: unit 3"
  ];

  const [selectedAssignment, setSelectedAssignment] = useState('');

  return (
    <div className="assignments-page">

      <div className="assignments-list">
        <h2>Assignments</h2>
        <ul>
        {assignments.map((assignment ) => (
          <li key={assignment}>
            <NavLink to={`/student-dashboard/assignments/assignment${assignment}`}>Assignment {assignment}</NavLink>
          </li>
        ))}
      </ul>
      </div>

      <div className="upload-assignment">
        <h2>Upload new Assignment</h2>
        <form>
          <input type="text" placeholder="Notes" />
          <input type="file" placeholder="Upload Assignment PDF" />
          <label> Select Assignment: <br/><br/>
            <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)} >
              <option value="" disabled> Select an assignment </option>
              {assignmentsFromAdmin.map((assignment, index) => (
                <option key={index} value={assignment}>{assignment}</option>
              ))}
            </select>
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
      
    </div>
  );
};

export default Assigments;