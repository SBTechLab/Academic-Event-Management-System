// Test email domain routing
const testEmailRouting = () => {
    const testCases = [
        { email: 'student@example.edu.in', expectedRole: 'student', dashboard: '/student-dashboard' },
        { email: 'faculty@charusat.ac.in', expectedRole: 'faculty', dashboard: '/faculty-dashboard' },
        { email: 'sbbhalani18@gmail.com', expectedRole: 'admin', dashboard: '/admin-dashboard' },
        { email: 'regular@gmail.com', expectedRole: 'student', dashboard: '/student-dashboard' }
    ];

    console.log('Email Domain Routing Test:');
    console.log('==========================');
    
    testCases.forEach(test => {
        let assignedRole = 'student';
        if (test.email.endsWith('@charusat.ac.in')) {
            assignedRole = 'faculty';
        } else if (test.email.endsWith('.edu.in')) {
            assignedRole = 'student';
        }
        
        const isCorrect = assignedRole === test.expectedRole;
        console.log(`${isCorrect ? '✅' : '❌'} ${test.email} → ${assignedRole} → ${test.dashboard}`);
    });
};

testEmailRouting();