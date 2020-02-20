import express from 'express';
import boom from 'express-boom';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import Users from "./src/sequelize/UsersModel";
import UserRoles from "./src/sequelize/UserRolesModel";
import UsersSessions from "./src/sequelize/UsersSessionsModel";
import ConfirmationTokens from "./src/sequelize/ConfirmationTokensModel";
import ChangePasswordTokens from "./src/sequelize/ChangePasswordTokensModel";
import sequelize from "./src/dal";
import router from "./src/routes";

const app = express();
const PORT = 8000;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Development', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

Users.hasMany(UsersSessions, { onDelete: "cascade" } );
Users.hasOne(ConfirmationTokens, { onDelete: "cascade" });
Users.hasOne(ChangePasswordTokens, { onDelete: "cascade" });
Users.hasOne(UserRoles, { onDelete: "cascade" });

sequelize.sync({ force: true })
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
