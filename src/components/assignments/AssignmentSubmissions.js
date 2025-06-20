import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../config';
import '../../styles/assignmentSubmissions.css';
import PDFAnnotationEditor from '../PDFAnnotationEditor/PDFAnnotationEditor';
import Modal from 'react-modal';

const AssignmentSubmissions = () => {
const { grade, groupId, assignmentId } = useParams();
const [assignment, setAssignment] = useState(null);
const [submissions, setSubmissions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [pdfURL, setPdfURL] = useState(null);
const [statusFilter, setStatusFilter] = useState('all');
const [sortBy, setSortBy] = useState('name');
const [sortOrder, setSortOrder] = useState('asc');
const [assignmentName, setAssignmentName] = useState('');

  // --- State for PDF Editor Modal ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSubmissionForMarking, setSelectedSubmissionForMarking] = useState(null);
  const [isSavingMarkedPdf, setIsSavingMarkedPdf] = useState(false); // For loading state during save

useEffect(() => {
    fetchAssignmentAndSubmissions();
}, [assignmentId, groupId]);

const fetchAssignmentAndSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Fetch submissions
    const submissionsResponse = await fetch(
        `${API_URL}/assignments/submissions?assignmentId=${assignmentId}&groupId=${groupId}`,{
        headers: {
            'Authorization': `MonaEdu ${token}`
        }
        });
    const submissionsData = await submissionsResponse.json();
    
    if (submissionsData.message === "Submission status for group fetched successfully.") {
        setSubmissions(submissionsData.data);
        setAssignmentName(submissionsData.assignmentName || '');
    } else {
        throw new Error(submissionsData.message || 'Failed to fetch submissions');
    }
    } catch (err) {
    setError(err.message);
    } finally {
    setLoading(false);
    }
};

const handleViewSubmission = async (studentId) => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
            `${API_URL}/assignments/submissions?assignmentId=${assignmentId}&groupId=${groupId}&studentId=${studentId}`,
            {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            }
        );
        
        const data = await response.json();
        
        if (data.message === "Submissions fetched successfully." && data.data.length > 0) {
            const submission = data.data[0];
            if (submission.path) {
                window.open(submission.path, '_blank');
            } else {
                alert('No PDF file found for this submission.');
            }
        } else {
            alert('No submission found for this student.');
        }
    } catch (error) {
        console.error('Error fetching submission:', error);
        alert('Error fetching submission. Please try again.');
    }
};

const getFilteredAndSortedSubmissions = () => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
    filtered = filtered.filter(sub => sub.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
    if (sortBy === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'date') {
        const dateA = a.submissionDetails?.SubmitDate || '';
        const dateB = b.submissionDetails?.SubmitDate || '';
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    }
    return 0;
    });

    return filtered;
};

const getSubmissionStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter(sub => sub.status === 'submitted').length;
    const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { total, submitted, percentage };
};

  // --- Functions for PDF Editor Modal ---

  const handleOpenMarkEditor = async (studentId) => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(
            `${API_URL}/assignments/submissions?assignmentId=${assignmentId}&groupId=${groupId}&studentId=${studentId}`,
            {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            }
        );
        const data = await response.json();
        console.log("Fetched submission data for marking: ", data);

        if (data.message === "Submissions fetched successfully." && data.data.length > 0) {
            const submission = data.data[0];    // <<< ADD THIS LOG
            if (submission.path) {
                // console.log(submission);
                setSelectedSubmissionForMarking(submission);
                setTimeout(() => setIsEditorOpen(true), 0); // Open modal after state is set
            } else {
                // console.error("No valid PDF path found in submission object:", submission);
                alert('No PDF file found for this submission.');
            }
        } else {
            // console.error("No submission found or error in API response:", data);
            alert('No submission found for this student.');
        }
    } catch (error) {
        console.error('Error in handleOpenMarkEditor: ', error);
        alert('Error fetching submission. Please try again.');
    }
};

const handleCloseMarkEditor = () => {
    setIsEditorOpen(false);
    setSelectedSubmissionForMarking(null);
};


if (loading) return <div className="loading">Loading submissions...</div>;
if (error) return <div className="error">{error}</div>;
// if (!assignment) return <div className="error">Assignment not found</div>;

const filteredSubmissions = getFilteredAndSortedSubmissions();
const stats = getSubmissionStats();

return (
    <div className="assignment-submissions-page">
    {assignmentName && (
        <div className="assignment-header">
            <h2>{assignmentName}</h2>
        </div>
    )}

    <div className="submissions-stats">
        <div className="stat-card">
        <h3>Submission Statistics</h3>
        <p>{stats.submitted} submitted out of {stats.total} total students</p>
        <p className="percentage">{stats.percentage}% submission rate</p>
        </div>
    </div>

    <div className="filters-section">
        <div className="filter-group">
        <label>Status:</label>
        <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
        >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="not submitted">Not Submitted</option>
        </select>
        </div>

        <div className="filter-group">
        <label>Sort by:</label>
        <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
        >
            <option value="name">Name</option>
            <option value="date">Submission Date</option>
        </select>
        <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
            {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        </div>
    </div>

    <div className="submissions-table-container">
        <table className="submissions-table">
        <thead>
            <tr>
            <th>Student Name</th>
            <th>Username</th>
            <th>Status</th>
            <th>Submission Date</th>
            <th>Grade</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {filteredSubmissions.map((student) => (
            <tr key={student._id}>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.userName} <br/> <p>id: {student._id}</p></td>
                <td>
                <span className={`status-badge ${student.status === 'submitted' ? 'submitted' : 'not-submitted'}`}>
                    {student.status}
                </span>
                </td>
                <td>{student.submissionDetails?.SubmitDate ? new Date(student.submissionDetails.SubmitDate).toLocaleDateString() : '-'}</td>
                <td>{student.submissionDetails?.grade || '-'}</td>
                <td>
                <div className="action-buttons">
                    <button 
                    className="view-btn"
                    onClick={() => handleViewSubmission(student._id)}
                    disabled={student.status !== 'submitted'}
                    >
                    View
                    </button>
                    <button 
                    className="mark-btn"
                    onClick={() => handleOpenMarkEditor(student._id)}
                    disabled={student.status !== 'submitted'}
                    >
                    Mark
                    </button>
                </div>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
     {/* --- PDF Editor Modal --- */}
    {selectedSubmissionForMarking && (
                <Modal
                    isOpen={isEditorOpen}
                    onRequestClose={handleCloseMarkEditor}
                    contentLabel="Mark Submission PDF"
                    className="pdf-editor-modal"
                    overlayClassName="pdf-editor-modal-overlay"
                    shouldCloseOnOverlayClick={!isSavingMarkedPdf}
                >
                    <div className="modal-header">
                        <h2>Marking: {selectedSubmissionForMarking.studentId.firstName} {selectedSubmissionForMarking.studentId.lastName}'s Submission</h2>
                        <button onClick={handleCloseMarkEditor} disabled={isSavingMarkedPdf} className="close-modal-btn">×</button>
                    </div>
                    <div className="modal-body">
                        <PDFAnnotationEditor
                            pdfUrl={selectedSubmissionForMarking.path}
                            submissionId={selectedSubmissionForMarking._id}
                            onSaveSuccess={handleCloseMarkEditor}
                        />
                    </div>
                </Modal>
            )}
    </div>
);
};

export default AssignmentSubmissions; 