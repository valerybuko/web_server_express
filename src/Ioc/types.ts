import {IUserController} from "../Domain";

const TYPES = {
  BaseController: Symbol.for('IBaseController'),
  MailerService: Symbol.for('IMailerService'),
  AccountController: Symbol.for('IAccountController'),
  AuthorizeService: Symbol.for('IAuthorizeService'),
  UserService: Symbol.for('IUserService'),
  UserController: Symbol.for('IUserController'),
  PasswordService: Symbol.for('IPasswordService'),
  AdminController: Symbol.for('IAdminController')
}

export default TYPES