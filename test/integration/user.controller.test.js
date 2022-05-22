process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const { it } = require("mocha");
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require("../../src/config/config");
const server = require("../../index");
chai.should();
chai.use(chaiHttp);
const dbconnection = require("../../database/dbconnection");


const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;
const INSERT_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city` ) VALUES" + 
                    "(1,'Mariëtte','van den Dullemen',1,'m.vandullemen@server.nl','secret','','','',''), " +
                    "(2,'John','Doe',1,'j.doe@server.com','secret','06 12425475','editor,guest','',''), " +
                    "(3,'Herman','Huizinga',1,'h.huizinga@server.nl','secret','06-12345678','editor,guest','',''), "+
                    "(4,'Marieke','Van Dam',0,'m.vandam@server.nl','secret','06-12345678','editor,guest','',''), " +
                    "(5,'Henk','Tank',1,'h.tank@server.com','secret','06 12425495','editor,guest','','');"

let token;

    before((done) => {
      token = jwt.sign({
              userId: 1
          },
          process.env.JWT_SECRET, {
              expiresIn: '100d'
          });

      wrongToken = jwt.sign({
              userId: 2
          },
          process.env.JWT_SECRET, {
              expiresIn: '100d'
          });
      done()
  })

describe("Manage users /api/user", () => {

  beforeEach((done) => {
    dbconnection.getConnection((err, connection) => {
        if (err) throw err;

        connection.query(CLEAR_DB + INSERT_USER, (err, results, fields) => {
            if (err) throw err;
            connection.release();
            done();
        });
    });
});

  describe("TC-201-1 add a user, all properties are required except id", () => {
    it("First name missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //First name missing
          lastName: "Joker",
          emailAdress: "janjoker@server.nl", 
          password: "secret",
          phoneNumber: "06-12345678",
          street: "PC Hooftstraat",
          city: "Amsterdam",
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
          emailAdress: "m.vandam@server.nl", //email that exists
          password: "secret",
          phoneNumber: "06-12345678",
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
          emailAdress: "janjoker@server.nl", 
          password: "secret",
          phoneNumber: "06-12345678",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

          console.log(res.body);

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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(404);
          done();
        });
    });
    it("TC-204-3 User ID exists", (done) => {
      chai
        .request(server)
        .get("/api/user/1")
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          isActive: true,
          emailAdress: "janjansen@server.nl",
          password: "secret",
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
        .put("/api/user/1")
        .set('authorization', 'Bearer ' + token)
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          isActive: true,
          emailAdress: `janjansen@gmail.com`,
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
        .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(400);
          done();
        });
    });

    it("TC-206-4 User deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/user/1")
        .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status } = res.body;

          status.should.equals(200);
          res.body.should.have.property("message");

          done();
        });
    });
  });

});
