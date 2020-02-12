import Sequelize from 'sequelize';
import sequelize from "../dal";

export const VerificationTokensModel = sequelize.define('verification_tokens', {
    tokenname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default VerificationTokensModel;
