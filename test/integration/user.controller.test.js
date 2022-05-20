process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const { it } = require("mocha");
const server = require("../../index");
chai.should();
chai.use(chaiHttp);

let userId;

describe("Manage users /api/user", () => {
  describe("TC-201-1 add a user, all properties are required except id", () => {
    it("First name missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //First name missing
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          emailAdress: "j.doe@server.com",
          password: "secret",
          phoneNumber: "06 12425475",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("First name must be a string");
          done();
        });
    });

    it("TC-201-4 User already exists", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          isActive: true,
          emailAdress: "m.vandullemen@server.nl", //email that exists
          password: "secretpassword",
          phoneNumber: "0612345678",
          roles: "editor,guest",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status } = res.body;
          status.should.equals(409);
          done();
        });
    });

    it("TC-201-5 User has been registered succesfully", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          emailAdress: "janjanjansen@server.nl", //email that exists
          password: "secretpassword",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

          console.log(res.body);

          //store id for delete test
          userId = result.id;

          status.should.equals(201);
          done();
        });
    });
  });

  describe("UC-201 Get all users", () => {
    it("TC-202-1 Show 0 users", (done) => {
      chai
        .request(server)
        .get("/api/user?limit=0")
        .end((req, res) => {
          let { result } = res.body;
          result.should.have.length(0);
          done();
        });
    });

    it("TC-202-2 Show 2 users", (done) => {
      chai
        .request(server)
        .get("/api/user?limit=2")
        .end((req, res) => {
          let { result } = res.body;
          result.should.have.length(2);
          done();
        });
    });

    it("TC-202-3 Show users with non-existent name", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=qr")
        .end((req, res) => {
          let { result } = res.body;
          result.should.have.length(0);
          done();
        });
    });

    it("TC-202-4 Show users with isActive = false", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=false")
        .end((req, res) => {
          let { result } = res.body;
          result.should.have.length(1);
          done();
        });
    });

    
    it("TC-202-5 Show users with isActive = true", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=true")
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(200);
          done();
        });
    });

    it("TC-202-3 Show users with existent name", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=ma&isActive=true")
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  // UC-204 Get user details
  describe("UC-204 Get user details", () => {
    // it("TC-204-1 Invalid token");
    it("TC-204-2 User ID doesn't exist", (done) => {
      chai
        .request(server)
        .get("/api/user/0")
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(404);
          done();
        });
    });
    it("TC-204-3 User ID exists", (done) => {
      chai
        .request(server)
        .get("/api/user/" + userId)
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  describe("UC-205 Update user", () => {
    it("TC-205-1 Email missing", (done) => {
      chai
        .request(server)
        .put("/api/user/1")
        .send({
          firstName: "Jet",
          lastName: "Jansen",
          isActive: true,
          // missing email should end up failing
          password: "secret",
          phoneNumber: "0612345678",
          roles: "editor,guest",
          street: "Hopstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Email must be a string");
          done();
        });
    });

    it("TC-205-4 User ID doesn't exist", (done) => {
      chai
        .request(server)
        .put("/api/user/0")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          isActive: true,
          emailAdress: "janjansen@server.nl",
          password: "secretpassword",
          phoneNumber: "0612345678",
          roles: "editor,guest",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(400);
          done();
        });
    });

    it("TC-205-6 User updated succesfully", (done) => {
      chai
        .request(server)
        .put("/api/user/" + userId)
        .send({
          firstName: "Jan",
          lastName: "Joker",
          isActive: true,
          emailAdress: `janjoker@gmail.com`,
          password: "secret",
          phoneNumber: "06-12345678",
          roles: "editor,guest",
          street: "Hopstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  describe("UC-206 Delete user", () => {
    it("TC-206-1 User doesn't exist", (done) => {
      chai
        .request(server)
        .delete("/api/user/0")
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(400);
          done();
        });
    });

    it("TC-206-4 User deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/user/" + userId)
        .end((req, res) => {
          let { status } = res.body;

          status.should.equals(200);
          res.body.should.have.property("message");

          done();
        });
    });
  });
});
