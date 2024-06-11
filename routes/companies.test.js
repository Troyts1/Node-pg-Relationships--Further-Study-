process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let newCompany;
beforeEach(async function(){
  const result = await db.query(`INSERT INTO companies("code", "name", "description") VALUES 
    ('apple', 'Apple', 'Maker of OSX.'),
    ('ibm', 'IBM', 'Big blue.') RETURNING *`);
  newCompany = result.rows[0];
});

afterEach(async function(){
  await db.query(`DELETE FROM companies`)
})



afterAll(async () => {
  await db.end()
})



describe("GET/", () => {
  test("returns all companies", async function(){
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({"companies":[
      { code: "apple", name: "Apple", description: "Maker of OSX." },
      { code: "ibm", name: "IBM", description: "Big blue." }
    ]});
  });
});



describe("GET /companies/ibm", function() {

  test("retrieve a company by code", async function() {
    const res = await request(app).get("/companies/blablabla");
    expect(res.statusCode).toBe(404);
  });

  test("retrieve a company by code", async function() {
    const res = await request(app).get("/companies/ibm");
    expect(res.body).toEqual({
      "company": { code: "ibm", name: "IBM", description: "Big blue." }
    });
  });

});


describe("POST /companies", function() {

  test("post a new company", async function() {
    const res = await request(app).post("/companies").send({
      "name": "Yummy House", 
      "description": "very yummy house"
    });
    expect(res.body).toEqual({
      "company": {
        code: "yummy-house",
        name: "Yummy House",
        description: "very yummy house"
      }
    });
  });

  test("receive 500 status code for duplicate company", async function() {
    const res = await request(app).post("/companies").send({
      "code": "ibm",
      "name": "IBM",
      "description": "Big blue"
    });
    expect(res.status).toBe(500);
  });

});



describe("PUT /", function() {
  test("this should update a company", async function() {
    const res = await request(app).put("/companies/ibm")
      .send({ name: "newIBM", description: "amazing company" });
    expect(res.body).toEqual({
      "company": {
        code: "ibm", name: "newIBM", description: "amazing company",
      
      }
    });
  });

  test("return a 404 if no company found", async function() {
    const res = await request(app).put("/companies/blablabla")
      .send({ code: "ibm", name: "newIBM", description: "amazing company" });
    expect(res.status).toEqual(404);
  });
});


describe("/DELETE", function() {
  test("delete a company", async function() {
    const res = await request(app).delete("/companies/apple");
    expect(res.body).toEqual({ "message": "Company deleted" });
  });

  test("should return a 404 if there is no such company", async function() {
    const res = await request(app).delete("/companies/hehehe");
    expect(res.status).toEqual(404);
  });
});
