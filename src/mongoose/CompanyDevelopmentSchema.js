import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const CompanyDevelopmentSchema = new Schema({
    sales: {
        type: String,
        required: true
    },
    newDepartments: {
        type: String,
        required: true
    },
    newWorkers: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});
