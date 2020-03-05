import mongoose from 'mongoose';
import { CompanyDevelopmentSchema } from "../Dal/MongoDB/Mongoose/CompanyDevelopmentSchema";

const DevelopmentPlans = mongoose.model('CompanyDevelopmentPlans', CompanyDevelopmentSchema);

export const addNewPlans = (req, res) => {
    const newPlans = new DevelopmentPlans(req.body);

    newPlans.save((err, plan) => {
        if (err) {
            res.send(err);
        }
        res.json(plan);
    });
}

export const getCompanyPlans = (req, res) => {
    DevelopmentPlans.find({}, (err, plan) => {
        if (err) {
            res.send(err);
        }
        res.json(plan);
    });
}

export const getCompanyPlansWithID = (req, res) => {
    DevelopmentPlans.findById(req.params.planID, (err, plan) => {
        if (err) {
            res.send(err);
        }
        res.json(plan);
    });
}

export const updatePlan = (req, res) => {
    DevelopmentPlans.findOneAndUpdate({ _id: req.params.planID }, req.body, { new: true, useFindAndModify: false },  (err, plan) => {
        if (err) {
            res.send(err);
        }
        res.json(plan);
    });
}

export const deletePlan = (req, res) => {
    DevelopmentPlans.remove({ _id: req.params.planID }, (err, plan) => {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'successfully deleted contact' });
    });
}
