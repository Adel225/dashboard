import React, { useState } from 'react';
import '../../styles/materials.css';
import { API_URL } from '../../config';

const Materials = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null
  });

  const grades = [12, 11, 10, 9];

  const fetchGroups = async (grade) => {
    setLoadingGroups(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`https://backend-edu-site-5cnm.vercel.app/group/grades?grade=${grade}`, {
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      const data = await response.json();
      
      if (data.Message === "Groups fetched successfully") {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setGradeId(data.groups[0].gradeid);
        }
      } else {
        setError('Failed to fetch groups');
      }
    } catch (err) {
      setError('Error loading groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleGradeChange = (e) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    setSelectedGroups([]); // Reset selected groups when grade changes
    if (grade) {
      fetchGroups(grade);
    } else {
      setGroups([]);
    }
  };

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingMaterials(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/material/group/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      const data = await response.json();
      
      if (data.message === "Materials fetched successfully for the group") {
        setMaterials(data.data);
      } else {
        setError('Failed to fetch materials');
        setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Error loading materials');
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || selectedGroups.length === 0) {
      setError('Please select both grade and at least one group');
      return;
    }

    setSubmitStatus('Uploading materials...');
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('file', formData.file);
      formDataToSend.append('groupIds', JSON.stringify(selectedGroups));
      formDataToSend.append('gradeId', gradeId);

      console.log('Selected groups:', selectedGroups);
      console.log('Serialized groups:', JSON.stringify(selectedGroups));

      const response = await fetch('https://backend-edu-site-5cnm.vercel.app/material/create', {
        method: 'POST',
        headers: {
          'Authorization': `MonaEdu ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload materials');
      }

      if (result.message === "Material uploaded successfully" && result.material) {
        setSubmitStatus(`Material "${result.material.name}" uploaded successfully`);
        // Reset form
        setFormData({
          name: '',
          description: '',
          file: null
        });
        setSelectedGroups([]);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Error uploading materials:', err);
      setError(err.message || 'Error uploading materials. Please try again.');
      setSubmitStatus('');
    }
  };

  const handleViewMaterial = async (materialId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`https://backend-edu-site-5cnm.vercel.app/material/${materialId}`, {
        method: 'GET',
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      const data = await response.json();
      
      if (data.message === "Material is ready for viewing") {
        // Refresh the materials list
        if (selectedGroupId) {
          handleGroupClick(selectedGroupId);
        }
        window.open(data.presignedUrl, '_blank');
      } else {
        setError('Failed to fetch material');
      }
    } catch (err) {
      console.error('Error fetching material:', err);
      setError('Error fetching material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`https://backend-edu-site-5cnm.vercel.app/material/${materialId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `MonaEdu ${token}`
          }
        });
        const data = await response.json();
        
        if (data.message === "Material deleted successfully") {
          // Refresh the materials list
          if (selectedGroupId) {
            handleGroupClick(selectedGroupId);
          }
        } else {
          setError('Failed to delete material');
        }
      } catch (err) {
        console.error('Error deleting material:', err);
        setError('Error deleting material');
      }
    }
  };

  return (
    <div className="materials-page">
      <div className="materials-left">
        <h2>Select Grade</h2>
        <div className="grades-list">
          {grades.map((grade) => (
            <div
              key={grade}
              className={`grade-card ${selectedGrade === grade ? 'selected' : ''}`}
              onClick={() => handleGradeChange({ target: { value: grade } })}
            >
              <h3>Grade {grade}</h3>
            </div>
          ))}
        </div>

        {selectedGrade && (
          <div className="groups-section">
            <h3>Groups in Grade {selectedGrade}</h3>
            {loadingGroups ? (
              <div className="loading">Loading groups...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <div className="groups-list">
                {groups.map((group) => (
                  <div 
                    key={group._id} 
                    className={`group-item ${selectedGroupId === group._id ? 'selected' : ''}`}
                    onClick={() => handleGroupClick(group._id)}
                  >
                    {group.groupname}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {materials.length > 0 && (
          <div className="materials-section">
            <h3>Materials</h3>
            {loadingMaterials ? (
              <div className="loading">Loading materials...</div>
            ) : (
              <ul className="materials-list">
                {materials.map((material) => (
                  <li 
                    key={material._id}
                    className="material-card"
                  >
                    <div className="material-info">
                      <span className="material-name">{material.name}</span>
                      <span className="material-description">{material.description}</span>
                    </div>
                    <div className="material-actions">
                      <button 
                        className="view-button"
                        onClick={() => handleViewMaterial(material._id)}
                      >
                        View
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteMaterial(material._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="upload-material">
        <h2>Upload new Material</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Material Name:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter Material Name" 
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter Material Description"
              required
            />
          </div>

          <div className="form-group">
            <label>Grade:</label>
            <select 
              value={selectedGrade} 
              onChange={handleGradeChange}
              required
            >
              <option value="">Choose grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Groups:</label>
            {loadingGroups ? (
              <div>Loading groups...</div>
            ) : (
              <div className="groups-list">
                <div className="select-all">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedGroups.length === groups.length && groups.length > 0}
                      onChange={() => {
                        if (selectedGroups.length === groups.length) {
                          setSelectedGroups([]);
                        } else {
                          setSelectedGroups(groups.map(group => group._id));
                        }
                      }}
                    />
                    Select All Groups
                  </label>
                </div>
                {groups.map((group) => (
                  <div key={group._id} className="group-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group._id)}
                        onChange={() => {
                          setSelectedGroups(prev => {
                            if (prev.includes(group._id)) {
                              return prev.filter(id => id !== group._id);
                            } else {
                              return [...prev, group._id];
                            }
                          });
                        }}
                      />
                      {group.groupname}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Material File:</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {submitStatus && <div className="submit-status">{submitStatus}</div>}

          <button type="submit" disabled={submitStatus === 'Uploading materials...'}>
            {submitStatus === 'Uploading materials...' ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Materials;