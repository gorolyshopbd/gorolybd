import pkg from 'pg';
const { Client } = pkg;
const c = new Client('postgres://postgres:shopio_password_123@localhost:5432/shopio');
c.connect().then(()=>console.log('Connected')).catch(e=>console.log('Full error:', e));
