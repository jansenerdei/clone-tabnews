import email from "infra/email.js";
import orchestrator from "../api/v1/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmail();
    await email.send({
      from: "JansenErdei <contato@jansenerdei.com.br>",
      to: "jansen@email.com",
      subject: "Teste de Assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: "JansenErdei <contato@jansenerdei.com.br>",
      to: "jansen@email.com",
      subject: "Último email",
      text: "Corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    console.log(lastEmail);
    expect(lastEmail.sender).toBe("<contato@jansenerdei.com.br>");
    expect(lastEmail.recipients[0]).toBe("<jansen@email.com>");
    expect(lastEmail.subject).toBe("Último email");
    expect(lastEmail.text).toBe("Corpo do último email\r\n");
  });
});
