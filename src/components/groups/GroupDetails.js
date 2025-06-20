import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/groups.css'; // Reusing some styles
import { API_URL } from '../../config';

const GroupDetails = () => {
  const { grade, group: groupNumberString } = useParams(); // group will be 'group1', 'group2', etc.
  const groupNumber = parseInt(groupNumberString.replace('group', ''), 10);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null); // New state to store the actual group ID

  useEffect(() => {
    console.log('GroupDetails component mounted/updated.');
    console.log('URL params - Grade:', grade, 'GroupNumberString:', groupNumberString);
    fetchGroupStudents();
  }, [grade, groupNumberString]); // Depend on groupNumberString to refetch when route changes

  const fetchGroupStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Fetching token:', token);
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return; // Stop execution if no token
      }

      console.log(`Fetching groups for grade ${grade}...`);
      const groupResponse = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      console.log('Group API response status:', groupResponse.status);

      if (!groupResponse.ok) {
        const errorData = await groupResponse.json();
        console.error('Group API error response:', errorData);
        throw new Error(errorData.Message || 'Failed to fetch groups');
      }

      const groupData = await groupResponse.json();
      console.log('Group API response data:', groupData);

      if (groupData.Message === "Groups fetched successfully") {
        const targetGroup = groupData.groups[groupNumber - 1];
        console.log('Target group based on index:', targetGroup);
        if (targetGroup) {
          setCurrentGroupId(targetGroup._id);
          console.log("group id set : " , targetGroup._id);
          
          // Use the student data directly from the group response
          const students = targetGroup.enrolledStudents.map(student => ({
            _id: student._id,
            userName: student.userName,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone,
            parentPhone: student.parentPhone,
            email: student.email,
            parentemail: student.email // Using email as parent email since it's not in the response
          }));
          
          setGroupStudents(students);
        } else {
          setError('Group not found at this index. Please check the URL.');
          setGroupStudents([]);
          setCurrentGroupId(null);
        }
      } else {
        throw new Error(groupData.Message || 'Failed to fetch groups: Unexpected message');
      }
    } catch (err) {
      console.error('Error fetching group students:', err);
      setError(err.message || 'Error loading group students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this group?`)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return; 
        }
        if (!currentGroupId) {
          setError('Error: Group ID not available for removal.');
          return;
        }
        console.log('Attempting to remove student:', { 
          studentid : studentId, 
          groupid: currentGroupId 
        });
        const response = await fetch(`${API_URL}/group/removestudent`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `MonaEdu ${token}`
          },
          body: JSON.stringify({ 
            studentid: studentId, 
            groupid: currentGroupId 
          })
        });

        const result = await response.json();
        console.log('Remove student API response:', result);

        if (!response.ok) {
          console.error('Remove student API error response:', result);
          throw new Error(result.Message || 'Failed to remove student from group');
        }

        fetchGroupStudents(); // Refresh the list of students in this group
        alert(result.Message || `Student ${studentName} removed from group successfully.`);
      } catch (err) {
        console.error('Error removing student from group:', err);
        setError(err.message || 'Error removing student. Please try again.');
      }
    }
  };

  const handleViewStudent = (student) => {
    setViewingStudent(student);
  };

  const closeViewStudentModal = () => {
    setViewingStudent(null);
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="group-details-page">
      <h2>Students in Grade {grade} - Group {groupNumber}</h2>
      {groupStudents.length > 0 ? (
        <div className="students-list-container">
          {groupStudents.map(student => (
            <div key={student._id} className="student-card">
              <p><strong>{student.firstName} {student.lastName}</strong></p>
              <div className="student-actions">
                <button className="view-btn" onClick={() => handleViewStudent(student)}>View</button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteStudent(student._id, student.userName)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No students found in this group.</p>
      )}

      {viewingStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Student Details</h3>
            <p><strong>Username:</strong> {viewingStudent.userName}</p>
            <p><strong>First Name:</strong> {viewingStudent.firstName}</p>
            <p><strong>Last Name:</strong> {viewingStudent.lastName}</p>
            <p><strong>Email:</strong> {viewingStudent.email}</p>
            <p><strong>Phone:</strong> {viewingStudent.phone || 'N/A'}</p>
            <p><strong>Parent Phone:</strong> {viewingStudent.parentPhone || 'N/A'}</p>
            <p><strong>Parent Email:</strong> {viewingStudent.parentemail || 'N/A'}</p>
            <button className="close-modal-btn" onClick={closeViewStudentModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;