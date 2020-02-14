import Sequelize from 'sequelize';
import sequelize from "../dal";

export const VerificationTokensModel = sequelize.define('verification_tokens', {
    confirm_token: {
        type: Sequelize.STRING
    },
    changepass_token: {
        type: Sequelize.STRING
    }
});

export default VerificationTokensModel;
