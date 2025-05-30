import React, { useState, useEffect } from 'react';
import '../../styles/materials.css';

const Materials = () => {
  const [materialsData, setMaterialsData] = useState([]);

  useEffect(() => {
    const data = [
      { grade: "Grade 12", count: 2 },
      { grade: "Grade 11", count: 1 },
      { grade: "Grade 10", count: 3 },
      { grade: "Grade 9", count: 1 },
    ];
    setMaterialsData(data);
  }, []);

  return (
    <div className="materials-page">
      <div className="materials-list">
        <h2>Materials</h2>
        <ul>
          {materialsData.map((material, index) => (
            <li key={index}>
              {material.grade} : {material.count} {material.count > 1 ? 'Materials' : 'Material'}
            </li>
          ))}
        </ul>
      </div>
      <div className="upload-material">
        <h2>Upload new Material</h2>
        <form>
          <input type="text" placeholder="Enter Material Name" />
          <input type="file" placeholder="Upload Material PDF" />
          <input type="text" placeholder="Grade" />
          <input type="text" placeholder="Group" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Materials;