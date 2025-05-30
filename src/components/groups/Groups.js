import React, { useState } from 'react';
import '../../styles/groups.css';

const initialGroupsData = {
  "Grade 12": [
    { name: "Group 1", members: 5 },
    { name: "Group 2", members: 14 },
    { name: "Group 3", members: 3 },
    { name: "Unassigned Student", members: 1 },
  ],
  "Grade 11": [
    { name: "Group 1", members: 5 },
    { name: "Group 2", members: 14 },
    { name: "Group 3", members: 3 },
    { name: "Unassigned Student", members: 1 },
  ],
  "Grade 10": [
    { name: "Group 1", members: 5 },
    { name: "Group 2", members: 14 },
    { name: "Group 3", members: 3 },
    { name: "Unassigned Student", members: 1 },
  ],
  "Grade 9": [
    { name: "Group 1", members: 5 },
    { name: "Group 2", members: 14 },
    { name: "Group 3", members: 3 },
    { name: "Unassigned Student", members: 1 },
  ],
};

const Groups = () => {
  const [groupsData, setGroupsData] = useState(initialGroupsData);

  const addGroup = (grade) => {
    const newGroups = [...groupsData[grade], { name: `Group ${groupsData[grade].length + 1}`, members: 0 }];
    setGroupsData({ ...groupsData, [grade]: newGroups });
  };

  const deleteGroup = (grade, index) => {
    const confirmation = window.confirm(`Are you sure you want to delete ${groupsData[grade][index].name}?`);
    if (confirmation) {
      const updatedGroups = groupsData[grade].filter((_, i) => i !== index); // delete request for the database
      setGroupsData({ ...groupsData, [grade]: updatedGroups });
    }
  };

  return (
    <div className="groups-container">
      {Object.entries(groupsData).map(([grade, groups]) => (
        <div className="grade-section" key={grade}>
          <h3>{grade}</h3>
          <p>{`${grade} Groups`}</p>
          <ul>
            {groups.map((group, index) => (
              <li key={index} className="group-item">
                <a href={`/dashboard/groups/${grade.toLowerCase().replace(" ", "")}/group${index + 1}`}>
                  <span>{group.name}</span>
                </a>
                <span>{`${group.members} Members`}</span>
                <button className="delete-button" onClick={() => deleteGroup(grade, index)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button className="add-button" onClick={() => addGroup(grade)}>
            Add Group
          </button>
        </div>
      ))}
    </div>
  );
};

export default Groups;