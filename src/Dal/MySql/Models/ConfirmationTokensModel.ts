import Sequelize from 'sequelize';
import sequelize from './index';

export const ConfirmationTokensModel = sequelize.define('confirmation_tokens', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default ConfirmationTokensModel;
