import express, { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import {inject, injectable} from "inversify";
import types from "../Ioc/types";
import IUserService from "../Domain/Interfaces/IUserService";

const router = express.Router();

@injectable()
export default class AdminController {
    router: Router;
    userService: any;

    constructor(@inject(types.UserService) userService: IUserService) {
        this.router = express.Router();
        this.initializeRoutes();
        this.userService = userService;
    }

    private initializeRoutes = () => {
        const path = '/api/admin';

        this.router.put(`${path}/change`, this.changeUserRole);

        return router;
    }

    changeUserRole = async (req: Request, res: Response) => {
        const admin_id = req.query.admin_id;
        const id = req.query.id;
        const newUserRole = req.body.role;
        const role = await this.userService.checkAdminUserRole(admin_id);

        if(role !== 'admin') {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        await this.userService.changedUserRole(newUserRole, id).catch((err: any) => console.log(err));

        res.status(HttpStatus.OK).send();
    }
}

/*module.exports = () => {
    router.post('/add-development-plans',
        addNewPlans
    );

    router.get('/get-plans',
        getCompanyPlans
    );

    router.get('/plan/:planID',
        getCompanyPlansWithID
    );

    router.put('/update-plan/:planID',
        updatePlan
    );

    router.delete('/delete-plan/:planID',
        deletePlan
    )

    return router;
}*/
