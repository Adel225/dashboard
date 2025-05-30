import React, { useState, useEffect } from 'react';
import '../../styles/assignments.css';
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
  const grades = [12, 11, 10, 9];

  return (
    <div className="assignments-page">
      <div className="assignments-list">
        <h2>Assignments</h2>
        <ul>
        {grades.map((grade ) => (
          <li key={grade}>
            <NavLink to={`/dashboard/assignments/grade${grade}`}>Grade {grade}</NavLink>
          </li>
        ))}
      </ul>
      </div>
      <div className="upload-assignment">
        <h2>Upload new Assignment</h2>
        <form>
          <input type="text" placeholder="Enter Assignment Name" />
          <input type="file" placeholder="Upload Assignment PDF" />
          <input type="text" placeholder="Grade" />
          <input type="text" placeholder="Group" />
          <input type="date" placeholder="Assignment Start-Date" />
          <input type="date" placeholder="Assignment End-Date" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Assigments;