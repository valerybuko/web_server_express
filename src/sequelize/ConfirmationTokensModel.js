import Sequelize from 'sequelize';
import sequelize from "../dal";

export const ConfirmationTokensModel = sequelize.define('confirmation_tokens', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default ConfirmationTokensModel;
