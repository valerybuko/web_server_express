import configs from "./configs/configs";
import Sequelize from "sequelize";

const sequelize = new Sequelize(configs.db_name, configs.db_user, configs.db_password, configs.db_payload);


export default sequelize
