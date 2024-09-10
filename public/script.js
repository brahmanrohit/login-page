document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const successMessage = document.getElementById('success-message');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');

  registerLink.addEventListener('click', () => {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
  });

  loginLink.addEventListener('click', () => {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
  });

  loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      // Send login data to server
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      if (result.success) {
          window.location.href = '/dashboard';
      } else {
          alert('Invalid login');
      }
  });

  registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      // Send registration data to server
      const response = await fetch('/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
      });
      
      const result = await response.json();
      if (result.success) {
          window.location.href = '/dashboard';
      } else {
          alert('Registration failed');
      }
  });
});
