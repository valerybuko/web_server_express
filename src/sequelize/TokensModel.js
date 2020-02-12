import Sequelize from 'sequelize';
import sequelize from "../dal";

export const TokensModel = sequelize.define('users_sessions', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default TokensModel;
