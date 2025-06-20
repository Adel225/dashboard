import React, { useState, useEffect } from 'react';
import '../../styles/assignments.css';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const Assignments = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    startDate: '',
    endDate: ''
  });

  const grades = [12, 11, 10, 9];
  const navigate = useNavigate();

  const fetchGroups = async (grade) => {
    setLoadingGroups(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
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

  const handleGroupChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedGroups(selectedOptions);
  };

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingAssignments(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/group/all?groupId=${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      const data = await response.json();
      
      if (data.message === "Assignments fetched successfully") {
        setAssignments(data.data);
      } else {
        setError('Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Error loading assignments');
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignmentClick = (assignmentId) => {
    if (!selectedGroupId) {
      setError('No group selected');
      return;
    }
    navigate(`/dashboard/assignments/grade/${selectedGrade}/group/${selectedGroupId}/assignment/${assignmentId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || selectedGroups.length === 0) {
      setError('Please select both grade and at least one group');
      return;
    }

    setSubmitStatus('Uploading assignments...');
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('file', formData.file);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('groupIds', JSON.stringify(selectedGroups));
      formDataToSend.append('gradeId', gradeId);

      console.log('name', formData.name);
      console.log('startDate', formData.startDate);

      const response = await fetch(`${API_URL}/assignments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `MonaEdu ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload assignment');
      }

      if (result.message === "Assignment created successfully") {
        setSubmitStatus(`Assignment "${result.assignment.name}" created successfully`);
        // Reset form
        setFormData({
          name: '',
          file: null,
          startDate: '',
          endDate: ''
        });
        setSelectedGroups([]);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Error uploading assignment:', err);
      setError(err.message || 'Error uploading assignment. Please try again.');
      setSubmitStatus('');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}  T ${hours}:${minutes}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="assignments-page">
      <div className="assignments-left">
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
                    className={`group-item ${selectedGroups.includes(group._id) ? 'selected' : ''}`}
                    onClick={() => handleGroupClick(group._id)}
                  >
                    {group.groupname}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {assignments.length > 0 && (
          <div className="assignments-section">
            <h3>Assignments</h3>
            {loadingAssignments ? (
              <div className="loading">Loading assignments...</div>
            ) : (
              <ul className="assignments-list">
                {assignments.map((assignment) => (
                  <li 
                    key={assignment._id}
                    className="assignment-card"
                    onClick={() => handleAssignmentClick(assignment._id)}
                    style={{ position: 'relative' }}
                  >
                    <button
                      className="delete-btn delete-btn-corner"
                      style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 2 }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this assignment?')) {
                          try {
                            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                            const response = await fetch(`${API_URL}/assignments/delete`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `MonaEdu ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ assignmentId: assignment._id }),
                            });
                            const result = await response.json();
                            if(result.message === "Assignment and all related data deleted successfully.")
                              window.alert('Assignment deleted.');
                            // Refresh assignments
                            if (selectedGroupId) handleGroupClick(selectedGroupId);
                          } catch (err) {
                            window.alert('Failed to delete assignment.');
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="view-btn"
                      style={{ position: 'absolute', bottom: 10, right: 85, zIndex: 2 }}
                      onClick={e => {
                        e.stopPropagation();
                        if (assignment.path) {
                          window.open(assignment.path, '_blank');
                        } else {
                          window.alert('No file available for this assignment.');
                        }
                      }}
                    >
                      View
                    </button>
                    <div className="assignment-info">
                      <span className="assignment-name">{assignment.name}</span>
                      <span className="assignment-dates">
                        Start: {formatDate(assignment.startDate)} <br />
                        End: {formatDate(assignment.endDate)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="assignments-right">
        <h2>Upload new Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Grade:</label>
            <select 
              value={selectedGrade} 
              onChange={handleGradeChange}
              required
            >
              <option value="">Select Grade</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Groups:</label>
            <select 
              multiple
              value={selectedGroups}
              onChange={handleGroupChange}
              required
              disabled={!selectedGrade || loadingGroups}
            >
              {groups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.groupname}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple groups</small>
          </div>

          <div className="form-group">
            <label>Assignment Name:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter Assignment Name" 
              required
            />
          </div>

          <div className="form-group">
            <label>Assignment File:</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date and Time:</label>
            <input 
              type="datetime-local" 
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date and Time:</label>
            <input 
              type="datetime-local" 
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {submitStatus && <div className="submit-status">{submitStatus}</div>}

          <button type="submit" disabled={submitStatus === 'Uploading assignments...'}>
            {submitStatus === 'Uploading assignments...' ? 'Uploading...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assignments;