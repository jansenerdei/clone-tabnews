test("GET to /api/v1/status should return 200", async () => {
    const response = await fetch("https://jansenerdei.com.br/api/v1/status")
    console.log(response.status)
    expect(response.status).toBe(200)
})
