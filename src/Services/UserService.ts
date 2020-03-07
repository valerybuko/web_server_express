import PasswordService from "./PasswordService";
import Users from "../Dal/MySql/Models/UsersModel";
import UserRoles from "../Dal/MySql/Models/UserRolesModel";
import UsersSessions from "../Dal/MySql/Models/UsersSessionsModel";
import {injectable} from "inversify";

@injectable()
export default class UserService {
    constructor() {
    }

    addNewUser = (user: any) => {
        const passwordHelper = new PasswordService();
        const salt = passwordHelper.generateSalt();
        const password = passwordHelper.generateHash(user.password, salt)
        const {username, email, city, birthdate} = user;
        return Users.create({ username, email, password, salt, city, birthdate })
    }

    createUserRole = async (userrole: string, id: number) => {
        return UserRoles.create({role: userrole, userId: id});
    }

    changedUserRole = async (userrole: string, id: number) => {
        return UserRoles.update({ role: userrole }, {
            where: {
                userId: id
            }
        });
    }

    getAllUsers = () => {
        return Users.findAll({raw:true})
    }

    getUserWithID = (id: number) => {
        return Users.findByPk(id)
    }

    getRoleWithID = (id: number) => {
        return UserRoles.findByPk(id)
    }

    confirmUser = (id: number) => {
        return Users.update({ isConfirm: true }, {
            where: {
                id
            }
        })
    }

    updateUser = (id: number, user: any, salt: string, password: string) => {
        const { username, email, role, isConfirm, city, birthdate } = user;
        return Users.update({ username, email, password, salt, role, isConfirm, city, birthdate }, {
            where: {
                id
            }
        })
    }

    updateUserPassword = (id: number, password: string, salt: string) => {
        return Users.update({ password, salt }, {
            where: {
                id
            }
        })
    };

    deleteUser = (id: number) => {
        return Users.destroy({
            where: {
                id
            }
        })
    }

    deleteUserSession = (id: number) => {
        return UsersSessions.destroy({
            where: {
                userId: id
            }
        })
    }

    getUserByEmail = (email: string) => {
        return Users.findOne({
            where: {
                email
            }
        });
    }

    getUserRoleByUserId = (id: number) => {
        return UserRoles.findOne({
            where: {
                userId: id
            }
        });
    }

    checkAdminUserRole = async (id: number) => {
        const userRolesObject = await this.getUserRoleByUserId(id);
        const userRole = userRolesObject.dataValues.role;
        return userRole;
    }
}
