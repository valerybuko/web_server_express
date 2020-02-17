import express from 'express';
import boom from 'express-boom';
import bodyParser from 'body-parser';
import Users from "./src/sequelize/UsersModel";
import UsersSessions from "./src/sequelize/UsersSessionsModel";
import ConfirmationTokens from "./src/sequelize/ConfirmationTokensModel";
import ChangePasswordTokens from "./src/sequelize/ChangePasswordTokensModel";
import sequelize from "./src/dal";
import router from "./src/routes";

const app = express();
const PORT = 8000;

Users.hasMany(UsersSessions, { onDelete: "cascade" } );
Users.hasOne(ConfirmationTokens, { onDelete: "cascade" });
Users.hasOne(ChangePasswordTokens, { onDelete: "cascade" });

sequelize.sync({ force: true })
    .then(res => console.log('Connection to the database has been successful'))
    .catch(err => console.log);

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