const bcrypt = require('bcryptjs');

async function hashAndPrint() {
    const password = '1234';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
}

hashAndPrint();
