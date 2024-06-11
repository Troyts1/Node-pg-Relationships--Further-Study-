process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let invoices;

beforeEach(async function() {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);

  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big Blue.')
  `);

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date)
     VALUES ('apple', 100, false, null),
            ('apple', 200, false, null),
            ('apple', 300, true, '2018-01-01'),
            ('ibm', 400, false, null)
     RETURNING *`
  );

  invoices = result.rows;
});


afterEach(async function() {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
});


afterAll(async () => {
  await db.end()
})


describe("GET/", function(){
test("returns all invoices", async function(){
  const res = await request(app).get("/invoices");
  expect(res.body).toEqual({
    "invoices": [
              {id: invoices[0].id, comp_code: "apple"},
              {id: invoices[1].id, comp_code: "apple"},
              {id: invoices[2].id, comp_code: "apple"},
              {id: invoices[3].id, comp_code: "ibm"},
            ]
          });
        });
      });
      

describe("GET /invoices/:id", function() {
  test("retrieves info about a specific invoice", async function() {
    const res = await request(app).get(`/invoices/${invoices[0].id}`);
    expect(res.body).toEqual({
      invoice: {
        id: invoices[0].id,
        amt: 100,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
        company: {
          code: "apple",
          name: "Apple",
          description: "Maker of OSX.",
        }
      }
    });

    expect(res.status).toBe(200);
  });

  test("returns a 404 if no invoice found", async function() {
    const res = await request(app).get(`/invoices/99999`); 
    expect(res.status).toEqual(404);

  });
});


describe("POST /invoices", function() {
  test("adds a new invoice", async function() {
    const res = await request(app)
      .post("/invoices")
      .send({ amt: 100, comp_code: "apple" });

    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: "apple",
        amt: 100,
        add_date: expect.any(String),
        paid: false,
        paid_date: null
      }
    });
  });
});



describe("PUT /:id", function() {
  test("puts a new invoice", async function() {
    const res = await request(app)
      .put(`/invoices/${invoices[0].id}`)
      .send({ amt: 500, paid: false }); 

    expect(res.body).toEqual({
      invoice: {
        id: invoices[0].id,
        comp_code: "apple",
        paid: false,
        amt: 500,
        add_date: expect.any(String),
        paid_date: null
      }
    });
  });

  test("returns a 404 error for no invoice found", async function() {
    const res = await request(app).put("/invoices/255").send({ amt: 300 });
    expect(res.status).toEqual(404);
  });
});


describe("DELETE /:id", function() {
  test("deletes an invoice", async function() {
    const res = await request(app).delete(`/invoices/${invoices[0].id}`);
    expect(res.body).toEqual({ "status": "deleted" });
  });

  test("returns a 404 if no invoice found", async function() {
    const res = await request(app).delete("/invoices/255");
    expect(res.status).toEqual(404);
  });
});
