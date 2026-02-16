const bcrypt = require('bcryptjs');

// Test the exact password and hash
const password = 'admin123';
const hash = '$2b$10$Ilu8/l6.3yOfiahzR6C/8uuGfuH5ee7wmzY/Vk9uwXrGF47HIqxkC';

console.log('Password:', password);
console.log('Hash:', hash);
console.log('Match:', bcrypt.compareSync(password, hash));

// Test login API
const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sbbhalani18@gmail.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        console.log('\nAPI Response:');
        console.log('Status:', response.status);
        console.log('Data:', data);
    } catch (error) {
        console.log('Error:', error.message);
    }
};

testLogin();