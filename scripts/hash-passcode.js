const bcrypt = require('bcryptjs');
const passcode = process.argv[2] || 'changeme123';
bcrypt.hash(passcode, 10).then((hash) => console.log(hash));
