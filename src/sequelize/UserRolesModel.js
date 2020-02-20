import Sequelize from "sequelize";
import sequelize from "../dal";

const UserRolesModel = sequelize.define('user_roles', {
    role: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default UserRolesModel;
