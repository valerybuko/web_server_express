import Sequelize from "sequelize";
import sequelize from "./index";

const UserRolesModel = sequelize.define('user_roles', {
    role: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export default UserRolesModel;
