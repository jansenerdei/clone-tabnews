import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator";
import user from "models/user.js";
import session from "models/session";

const emailHtppUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }

  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 5000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHtppUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDataBase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmail() {
  await fetch(`${emailHtppUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHtppUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = await emailListBody.pop();

  const emailTextResponse = await fetch(
    `${emailHtppUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

const orchestrator = {
  waitForAllServices,
  clearDataBase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmail,
  getLastEmail,
};

export default orchestrator;
