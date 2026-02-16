// Test coordinator request functionality
const testCoordinatorRequest = async () => {
    const baseUrl = 'http://localhost:5001/api';
    
    // Test data - you'll need a real student token
    const studentToken = 'your_student_jwt_token_here';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
    };

    try {
        console.log('Testing Coordinator Request System...\n');

        // 1. Test creating a request
        console.log('1. Creating coordinator request...');
        const createResponse = await fetch(`${baseUrl}/coordinator-requests`, {
            method: 'POST',
            headers
        });
        
        if (createResponse.ok) {
            const data = await createResponse.json();
            console.log('✅ Request created:', data);
        } else {
            const error = await createResponse.json();
            console.log('❌ Create failed:', error);
        }

        // 2. Test getting own request
        console.log('\n2. Getting my request...');
        const myRequestResponse = await fetch(`${baseUrl}/coordinator-requests/my-request`, {
            headers
        });
        
        if (myRequestResponse.ok) {
            const data = await myRequestResponse.json();
            console.log('✅ My request:', data);
        } else {
            console.log('❌ Get my request failed');
        }

        // 3. Test getting pending requests (faculty view)
        console.log('\n3. Getting pending requests...');
        const pendingResponse = await fetch(`${baseUrl}/coordinator-requests/pending`, {
            headers
        });
        
        if (pendingResponse.ok) {
            const data = await pendingResponse.json();
            console.log('✅ Pending requests:', data);
        } else {
            console.log('❌ Get pending failed');
        }

    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
};

console.log('To test coordinator requests:');
console.log('1. Login as a student to get JWT token');
console.log('2. Replace "your_student_jwt_token_here" with actual token');
console.log('3. Run: node test_coordinator_requests.js');
console.log('\nOr test directly from StudentDashboard in browser');

// testCoordinatorRequest();