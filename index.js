import express from 'express';
import boom from 'express-boom';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import sequelize from "./src/DAL/Sequelize";
import router from "./src/Controllers";

const app = express();
const PORT = 8001;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Development', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

sequelize.sync( {force: true} )
    .then(res => console.log('Connection to the database has been successful'))
    .catch(err => console.log(err));

app.use(boom());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

app.get('/', (req, res) => {
  res.send(`Node and express server running on port ${PORT}`);
});

app.listen(PORT, async(req, res) => {
  console.log(`Server has been statred on port ${PORT}`);
});
