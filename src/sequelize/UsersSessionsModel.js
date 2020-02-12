import Sequelize from 'sequelize';
import sequelize from "../dal";

export const UsersSessionsModel = sequelize.define('users_sessions', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default UsersSessionsModel;
