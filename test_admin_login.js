// Test admin login
const fetch = require('node-fetch');

const testAdminLogin = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'sbbhalani11@gmail.com',
                password: 'password123'
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Admin login successful!');
            console.log('User:', data.user);
            console.log('Token:', data.token ? 'Generated' : 'Missing');
        } else {
            console.log('❌ Admin login failed:');
            console.log('Status:', response.status);
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
};

testAdminLogin();