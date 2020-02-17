import Sequelize from 'sequelize';
import sequelize from "../dal";

export const ConfirmationTokensModel = sequelize.define('confirmation_tokens', {
    confirmation_token: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default ConfirmationTokensModel;
