process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = require('chai');
const { it } = require("mocha");
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require("../../src/config/config");
const server = require("../../index");
chai.expect();
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
const INSERT_MEALS = "INSERT INTO `meal` VALUES" +
                    "(1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',1,'2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose'), " +
                    "(2,1,1,0,0,'2022-05-22 13:35:00',4,12.75,'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-04-25 12:56:05.000000','Aubergine uit de oven met feta, muntrijst en tomatensaus','Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.','noten'), " +
                    "(3,1,0,0,1,'2022-05-22 17:30:00',4,10.75,'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-03-15 14:10:19.000000','Spaghetti met tapenadekip uit de oven en frisse salade','Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.','gluten,lactose'), " +
                    "(4,1,0,0,0,'2022-03-26 21:22:26',4,4.00,'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg',3,'2022-03-06 21:23:45.419085','2022-03-12 19:51:57.000000','Zuurkool met spekjes','Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ',''), " +
                    "(5,1,1,0,1,'2022-03-26 21:24:46',6,6.75,'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',3,'2022-03-06 21:26:33.048938','2022-03-12 19:50:13.000000','Groentenschotel uit de oven','Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.',''); "
                    

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

        connection.query(CLEAR_DB + INSERT_USER + INSERT_MEALS, (err, results, fields) => {
            if (err) throw err;
            connection.release();
            done();
        });
    });
});

  describe("TC-201 Add a user", () => {
    it("TC-201-1 add a user, all properties are required except id ,first name missing or invalid, return valid error", (done) => {
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

    it("TC-201-2 Not valid email", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          emailAdress: "janjansen@@server.nl", 
          password: "secret",
          phoneNumber: "06-12345678",
          roles: "editor,guest",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Invalid email format");
          done();
        });
    });

    it("TC-201-3 Not valid password", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          emailAdress: "janjansen@server.nl", 
          password: "s",
          phoneNumber: "06-12345678",
          roles: "editor,guest",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Invalid password format");
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
          emailAdress: "janjansen@server.nl", 
          password: "secret",
          phoneNumber: "06-12345678",
          street: "PC Hooftstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

          console.log(res.body);

          expect(result.firstName).to.equal('Jan')
          expect(result.lastName).to.equal('Jansen')
          expect(result.isActive).to.equal(true)
          expect(result.emailAdress).to.equal('janjansen@server.nl')
          expect(result.password).to.equal('secret')
          expect(result.phoneNumber).to.equal('06-12345678')
          expect(result.street).to.equal('PC Hooftstraat')
          expect(result.city).to.equal('Amsterdam')
          expect(result.roles).to.equal('editor,guest')

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

    // UC-203 Get user profile
    describe("UC-203 Get user profile", () => {
      it("TC-203-1 Invalid token", (done) => {
        chai
          .request(server)
          .get("/api/user/0")
          .set('authorization', 'Bearer ' + 123)
          .end((req, res) => {
            let { status, error } = res.body;
            status.should.equals(401);
            error.should.be
            .a("string")
            .that.equals("Not authorized");
            done();
          });
      });
      it("TC-203-2 User exists and valid token", (done) => {
        chai
          .request(server)
          .get("/api/user/1")
          .set('authorization', 'Bearer ' + token)
          .end((req, res) => {
            let { status, result } = res.body;

            expect(result.firstName).to.equal('Mariëtte')
            expect(result.lastName).to.equal('van den Dullemen')
            expect(result.isActive).to.equal(1)
            expect(result.emailAdress).to.equal('m.vandullemen@server.nl')
            expect(result.password).to.equal('secret')

            console.log(result)
            status.should.equals(200);
            done();
          });
      });
    });
  

  // UC-204 Get user details
  describe("UC-204 Get user details", () => {
    it("TC-204-1 Invalid token", (done) => {
      chai
        .request(server)
        .get("/api/user/0")
        .set('authorization', 'Bearer ' + 123)
        .end((req, res) => {
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be
          .a("string")
          .that.equals("Not authorized");
          done();
        });
    });
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

    it("TC-205-3 Not valid phoneNumber", (done) => {
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
          phoneNumber: "00000000000",
          roles: "editor,guest",
          street: "Hopstraat",
          city: "Amsterdam",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string")
          .that.equals("Invalid phone number format")
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

    it("TC-205-5 Not logged in", (done) => {
      chai
        .request(server)
        .put("/api/user/0")
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
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be.a("string")
          .that.equals("Not logged in!")
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
          emailAdress: `janjansen@gmail.com`,
          password: "secret",
          street: "Hopstraat",
          city: "Amsterdam",
          phoneNumber: "06-12345678",
        })
        .end((req, res) => {
          let { status, result} = res.body;

          expect(result.firstName).to.equal('Jan')
          expect(result.lastName).to.equal('Jansen')
          expect(result.isActive).to.equal(1)
          expect(result.emailAdress).to.equal('janjansen@gmail.com')
          expect(result.password).to.equal('secret')
          expect(result.phoneNumber).to.equal('06-12345678')
          expect(result.street).to.equal('Hopstraat')
          expect(result.city).to.equal('Amsterdam')

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

    it("TC-206-2 Not logged in", (done) => {
      chai
      .request(server)
      .delete("/api/user/1")
        .end((req, res) => {
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be.a("string")
          .that.equals("Not logged in!")
          done();
        });
    });

    it("TC-206-3 No owner rights", (done) => {
      chai
      .request(server)
      .delete("/api/user/4")
      .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be.a("string")
          .that.equals("No permission to delete this user, no owner rights")
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
