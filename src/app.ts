import express, { Express } from 'express';
import boom from 'express-boom';
import bodyParser from 'body-parser';
import { IBaseController } from './Domain';
import Ioc from './Ioc';
import Types from './Ioc/types';
/*import mongoose from 'mongoose';*/

const app = express();
const PORT = 8001;


export default class Application {
    private app: Express
    private readonly baseController: IBaseController

    constructor() {
      this.app = express();
      this.baseController = Ioc.get<IBaseController>(Types.BaseController); 
        /*mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/Development', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });*/

        /*sequelize.sync({force: true})
            .then(res => console.log('Connection to the database has been successful'))
            .catch(err => console.log(err));*/

        this.app.use(boom());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json());
        this.app.use(this.baseController.router);

        this.app.get('/', (req, res) => {
            res.send(`Node and express server running on port ${PORT}`);
        });

        this.app.listen(PORT, async (req, res) => {
            console.log(`Server has been statred on port ${PORT}`);
        });
    }
}

new Application();
