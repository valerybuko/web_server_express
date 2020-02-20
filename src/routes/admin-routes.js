import express from 'express';
import HttpStatus from 'http-status-codes';
import badRequestErrorHandler from "../errors/BadRequestErrorHandler";
import {changedUserRole, checkAdminUserRole } from '../services/user-service';
import {addNewPlans, deletePlan, getCompanyPlans, getCompanyPlansWithID, updatePlan} from '../services/company-service';

const router = express.Router();

module.exports = () => {
    router.put('/change/userrole',
        badRequestErrorHandler(async (req, res) => {
            const { admin_id, userrole, id } = req.body;

            const role = await checkAdminUserRole(admin_id);

            if(role !== 'admin') {
                return res.status(HttpStatus.FORBIDDEN).send();
            }

            await changedUserRole(userrole, id).catch(err => console.log(err));

            res.status(HttpStatus.OK).send();
        })
    );

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
}
