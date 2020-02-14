const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    db_name: `${process.env.DB_NAME}`,
    db_user: `${process.env.DB_USERNAME}`,
    db_password: `${process.env.DB_PASSWORD}`,
    db_payload: {
        dialect: 'mysql',
        host: `${process.env.DB_PAYLOAD_HOST}`
    }
}
