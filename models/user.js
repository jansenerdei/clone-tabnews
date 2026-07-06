import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUserName(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
          SELECT 
            * 
          FROM 
            users
          WHERE
            LOWER(username) = LOWER($1)
          LIMIT
            1
          ;`,
      values: [username],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValue) {
  await validateUniqueUsername(userInputValue.username);
  await validateUniqueEmail(userInputValue.email);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `
          SELECT 
            username 
          FROM 
            users
          WHERE
            LOWER(username) = LOWER($1)
          ;`,
      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já esta sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `
          SELECT 
            email 
          FROM 
            users
          WHERE
            LOWER(email) = LOWER($1)
          ;`,
      values: [email],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já esta sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function runInsertQuery(userInputValue) {
    const results = await database.query({
      text: `
          INSERT INTO 
            users (username, email, password) 
          VALUES 
            ($1, $2, $3)
          RETURNING
            *
          ;`,
      values: [
        userInputValue.username,
        userInputValue.email,
        userInputValue.password,
      ],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUserName,
};

export default user;
