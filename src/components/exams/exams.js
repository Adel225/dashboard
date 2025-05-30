import React, { useState, useEffect } from 'react';
import '../../styles/exams.css';
import { NavLink } from 'react-router-dom';

const Exams = () => {

  // Example dynamic data (can be replaced with an API call)
  // useEffect(() => {
  //   const data = [
  //     { grade: "Grade 12", count: 2 },
  //     { grade: "Grade 11", count: 1 },
  //     { grade: "Grade 10", count: 3 },
  //     { grade: "Grade 9", count: 1 },
  //   ];
  //   setExamsData(data);
  // }, []);
  const grades = [12, 11, 10, 9];

  return (
    <div className="exams-page">
      <div className="exams-list">
        <h2>Exams</h2>
        <ul>
          {grades.map((grade) => (
            <li key={grade}>
              <NavLink to={`/dashboard/exams/grade${grade}`}>Grade {grade}</NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="upload-exam">
        <h2>Upload new Exam</h2>
        <form>
          <input type="text" placeholder="Enter Exam Name" />
          <input type="file" placeholder="Upload Exam PDF" />
          <input type="text" placeholder="Grade" />
          <input type="text" placeholder="Group" />
          <input type="date" placeholder="Exam Start-Date" />
          <input type="date" placeholder="Exam End-Date" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Exams;