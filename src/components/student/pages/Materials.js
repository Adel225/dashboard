import React from 'react';

const StudentMaterials = () => {
  return (
    <div>
      <h2>Study Materials</h2>
      <ul>
        <li><a href="/materials/material1.pdf" download>Material 1</a></li>
        <li><a href="/materials/material2.pdf" download>Material 2</a></li>
      </ul>
    </div>
  );
};

export default StudentMaterials;