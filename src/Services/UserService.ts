import PasswordService from "./PasswordService";
import Users from "../Dal/MySql/Models/UsersModel";
import UserRoles from "../Dal/MySql/Models/UserRolesModel";
import UsersSessions from "../Dal/MySql/Models/UsersSessionsModel";
import {inject, injectable} from "inversify";
import UserEntity from "../Domain/Entities/UserEntity";
import UserRoleEntity from "../Domain/Entities/UserRoleEntity";
import {IUserService} from "../Domain";

@injectable()
export default class UserService implements IUserService{
    constructor() {
    }

    addNewUser = (user: UserEntity): Promise<UserEntity> => {
        const passwordService = new PasswordService(); // delete new
        const salt = passwordService.generateSalt();
        const password = passwordService.generateHash(salt, user.password)
        const {username, email, city, birthdate} = user;
        return Users.create({ username, email, password, salt, city, birthdate })
    }

    createUserRole = async (userrole: string, id: number): Promise<UserRoleEntity | undefined> => {
        return UserRoles.create({role: userrole, userId: id});
    }

    changedUserRole = async (userrole: string, id: number): Promise<UserRoleEntity | undefined> => {
        return UserRoles.update({ role: userrole }, {
            where: {
                userId: id
            }
        });
    }

    getAllUsers = (): Promise<UserEntity | undefined> => {
        return Users.findAll({raw:true})
    }

    getUserWithID = (id: number): Promise<UserEntity | undefined> => {
        return Users.findByPk(id)
    }

    getRoleWithID = (id: number): Promise<UserEntity | undefined> => {
        return UserRoles.findByPk(id)
    }

    confirmUser = (id: number): Promise<UserEntity | undefined> => {
        return Users.update({ isConfirm: true }, {
            where: {
                id
            }
        })
    }

    unconfirmUser = (id: number): Promise<UserEntity | undefined> => {
        return Users.update({ isConfirm: false }, {
            where: {
                id
            }
        })
    }

    updateUser = (id: number, user: any, salt: string, password: string): Promise<UserEntity | undefined> => {
        const { username, email, role, isConfirm, city, birthdate } = user;
        return Users.update({ username, email, password, salt, role, isConfirm, city, birthdate }, {
            where: {
                id
            }
        })
    }

    updateUserPassword = (id: number, password: string, salt: string): Promise<UserEntity | undefined> => {
        return Users.update({ password, salt }, {
            where: {
                id
            }
        })
    };

    deleteUser = (id: number): Promise<UserEntity | undefined> => {
        return Users.destroy({
            where: {
                id
            }
        })
    }

    deleteUserSession = (id: number): Promise<number> => {
        return UsersSessions.destroy({
            where: {
                userId: id
            }
        })
    }

    getUserByEmail = (email: string): Promise<UserEntity | undefined> => {
        return Users.findOne({
            where: {
                email
            }
        });
    }

    getUserRoleByUserId = (id: number): Promise<UserRoleEntity | undefined> => {
        return UserRoles.findOne({
            where: {
                userId: id
            }
        });
    }

    checkAdminUserRole = async (id: number): Promise<string> => {
        const userRolesObject = await this.getUserRoleByUserId(id);
        const userRole = userRolesObject.dataValues.role;
        return userRole;
    }
}
