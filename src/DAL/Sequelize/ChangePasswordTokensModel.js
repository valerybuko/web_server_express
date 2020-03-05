import Sequelize from 'sequelize';
import sequelize from "./index";

export const ChangePasswordTokensModel = sequelize.define('change_password_tokens', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default ChangePasswordTokensModel;
