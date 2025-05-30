// Store users in memory
const users = [{
    username: 'test',
    email: 'test@test.com',
    password: 'test123',
    studentId: 'AR-H-123456789',
    role: 'student'
}];

// Generate student ID based on timestamp
const generateStudentId = () => {
    return `AR-H-${Date.now()}`;
};

// Check if user exists and credentials match
export const authenticateUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        // Check if it's the teacher's email
        if (email === 'adel.sameh.business@gmail.com') {
            user.role = 'teacher';
        } else {
            user.role = 'student';
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
};

// Register new user
export const registerUser = (username, email, password) => {
    if (users.find(u => u.email === email)) {
        throw new Error('User with this email already exists');
    }
    if (users.find(u => u.username === username)) {
        throw new Error('Username is already taken');
    }

    const studentId = generateStudentId();
    const newUser = {
        username,
        email,
        password,
        studentId,
        role: email === 'adel.sameh.business@gmail.com' ? 'teacher' : 'student'
    };
    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// Update user password
export const updateUserPassword = (studentId, currentPassword, newPassword) => {
    const userIndex = users.findIndex(u => u.studentId === studentId);
    if (userIndex === -1) {
        throw new Error('User not found');
    }

    const user = users[userIndex];
    if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
    }

    users[userIndex] = {
        ...user,
        password: newPassword
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
};

// Save auth data to sessionStorage
export const saveAuthData = (user, rememberMe = false) => {
    sessionStorage.setItem('authData', JSON.stringify({ user, rememberMe }));
};

// Get auth data from storage
export const getAuthData = () => {
    try {
        const sessionData = sessionStorage.getItem('authData');
        return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
        sessionStorage.removeItem('authData');
        return null;
    }
};

// Clear auth data
export const clearAuthData = () => {
    sessionStorage.removeItem('authData');
}; 