const FormData = require('form-data');
const { signupAction } = require('./frontend/lib/actions/auth');

async function testSignup() {
  try {
    console.log('Testing signup action...');

    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'Test123@');
    formData.append('confirmPassword', 'Test123@');

    console.log('Form data:', {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    });

    const result = await signupAction(formData);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSignup();