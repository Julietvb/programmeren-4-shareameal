process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const { expect } = require('chai');
const chaiHttp = require("chai-http");
const server = require("../../index");
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require("../../src/config/config");
chai.expect();
chai.should();
chai.use(chaiHttp);
const dbconnection = require("../../database/dbconnection");

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_MEALS = "INSERT INTO `meal` VALUES" +
"(1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',1,'2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose'), " +
"(2,1,1,0,0,'2022-05-22 13:35:00',4,12.75,'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-04-25 12:56:05.000000','Aubergine uit de oven met feta, muntrijst en tomatensaus','Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.','noten'), " +
"(3,1,0,0,1,'2022-05-22 17:30:00',4,10.75,'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg',2,'2022-02-26 18:12:40.048998','2022-03-15 14:10:19.000000','Spaghetti met tapenadekip uit de oven en frisse salade','Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.','gluten,lactose'), " +
"(4,1,0,0,0,'2022-03-26 21:22:26',4,4.00,'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg',3,'2022-03-06 21:23:45.419085','2022-03-12 19:51:57.000000','Zuurkool met spekjes','Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ',''), " +
"(5,1,1,0,1,'2022-03-26 21:24:46',6,6.75,'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',3,'2022-03-06 21:26:33.048938','2022-03-12 19:50:13.000000','Groentenschotel uit de oven','Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.',''); "
const INSERT_USER = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city` ) VALUES" + 
                    "(1,'Mariëtte','van den Dullemen',1,'m.vandullemen@server.nl','secret','','','',''), " +
                    "(2,'John','Doe',1,'j.doe@server.com','secret','06 12425475','editor,guest','',''), " +
                    "(3,'Herman','Huizinga',1,'h.huizinga@server.nl','secret','06-12345678','editor,guest','',''), "+
                    "(4,'Marieke','Van Dam',0,'m.vandam@server.nl','secret','06-12345678','editor,guest','',''), " +
                    "(5,'Henk','Tank',1,'h.tank@server.com','secret','06 12425495','editor,guest','','');"

  before((done) => {
      token = jwt.sign({
              userId: 1
          },
          process.env.JWT_SECRET, {
              expiresIn: '100d'
          });
      done()
  })

describe("Manage meals /api/meal", () => {    
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
  describe("TC-301-1 add a meal", () => {
    it("TC-301-1 Name missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + token)
        .send({
          //Name missing
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          // name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Name must be a string");
          done();
        });
    });

    it("TC-301-1 MaxParticipants missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + token)
        .send({
          //MaxParticipants missing
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          //   maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("maxAmountOfParticipants must be a number");
          done();
        });
    });

    it("TC-301-1 Price missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + token)
        .send({
          //Price missing
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          //   price: 6.00,
          name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Price must be a double");
          done();
        });
    });

    it("TC-301-2 Not logged in", (done) => {
      chai
        .request(server)
        .post("/api/meal/")
        .send({
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          cookId: 1,
          name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be.a("string")
          .that.equals("Not logged in!")
          done();
        });
    });

    it("TC-301-4 Meal already exists", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + token)
        .send({
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Pasta Bolognese met tomaat, spekjes en kaas",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status } = res.body;
          status.should.equals(409);
          done();
        });
    });

    it("TC-301-3 Meal has been registered succesfully", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + token)
        .send({
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          cookId: 1,
          name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

          expect(result.name).to.equal('Boerenkool met worst')
          expect(result.isVega).to.equal(0)
          expect(result.isVegan).to.equal(0)
          expect(result.isToTakeHome).to.equal(1)
          expect(result.dateTime).to.equal(null)
          expect(result.imageUrl).to.equal('')
          expect(result.maxAmountOfParticipants).to.equal(2)
          expect(result.price).to.equal('6.00')
          expect(result.description).to.equal('Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!')
          status.should.equals(201);
          done();
        });
    });
  });

  describe("UC-302 Update meal", () => {
    it("TC-302-1 Name missing", (done) => {
      chai.request(server)
        .put("/api/meal/1")
        .set('authorization', 'Bearer ' + token)
        .send({
        //Name missing
        isVega: 0,
        isVegan: 0,
        isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          // name: "Boerenkool met worst",
          description:
              "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Name must be a string");
          done();
        });
    });

    it("TC-302-2 Not logged in", (done) => {
      chai
        .request(server)
        .put("/api/meal/0")
        .send({
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Boerenkool met worst",
          description:
              "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be.a("string")
          .that.equals("Not logged in!")
          done();
        });
    });

    it("TC-302-3 No owner rights", (done) => {
      chai
        .request(server)
        .put("/api/meal/3")
        .set('authorization', 'Bearer ' + token)
        .send({
          isVega: 0,
          isVegan: 0,
          isToTakeHome: 1,
          maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Boerenkool met worst",
          description:
              "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be.a("string")
          .that.equals("Can't update meal, no owner rights")
          done();
        });
    });

    it("TC-302-4 meal ID doesn't exist", (done) => {
        chai.request(server)
            .put("/api/meal/0")
            .set('authorization', 'Bearer ' + token)
            .send({
              isVega: 0,
              isVegan: 0,
              isToTakeHome: 1,
              maxAmountOfParticipants: 2,
              price: 6.0,
              name: "Boerenkool met worst",
              description:
                  "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
            })
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(404);
                done();
            });
    });

    it("TC-302-5 meal updated succesfully", (done) => {
        chai.request(server)
            .put("/api/meal/1")
            .set('authorization', 'Bearer ' + token)
            .send({
              isVega: 0,
              isVegan: 0,
              isToTakeHome: 1,
              maxAmountOfParticipants: 2,
              price: 6.0,
              name: "Boerenkool met worst",
              description:
                  "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
            })
            .end((req, res) => {
                let { status } = res.body;
                status.should.equals(200);
                done();
            });
    });
  });

    // UC-304 Get all meals
    describe("UC-303 Get all meals", () => {
      it("TC-303-1 get all meals", (done) => {
        chai.request(server)
          .get("/api/meal")
          .end((req, res) => {
            let { status } = res.body;
            status.should.equals(200);
            done();
          });
      });
    });

    // UC-304 Get meal details
    describe("UC-304 Get meal details", () => {
      it("TC-304-1 meal ID doesn't exist", (done) => {
        chai.request(server)
          .get("/api/meal/0")
          .end((req, res) => {
            let { status } = res.body;
            status.should.equals(404);
            done();
          });
      });
      it("TC-304-2 meal ID exists", (done) => {
        chai
          .request(server)
          .get("/api/meal/1")
          .end((req, res) => {
            let { status } = res.body;
            status.should.equals(200);
            done();
          });
      });
    });

  describe("UC-305 Delete Meal", () => {
    it("TC-305-1 meal doesn't exist", (done) => {
      chai
        .request(server)
        .delete("/api/meal/0")
        .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(400);
          done();
        });
    });

    it("TC-305-2 Not logged in", (done) => {
      chai
      .request(server)
      .delete("/api/meal/1")
        .end((req, res) => {
          let { status, error } = res.body;
          status.should.equals(401);
          error.should.be.a("string")
          .that.equals("Not logged in!")
          done();
        });
    });

    it("TC-305-3 No owner rights", (done) => {
      chai
      .request(server)
      .delete("/api/meal/2")
      .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be.a("string")
          .that.equals("Can't delete meal, no owner rights")
          done();
        });
    });

    it("TC-305-4 Meal deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/meal/1" )
        .set('authorization', 'Bearer ' + token)
        .end((req, res) => {
          let { status } = res.body;

          status.should.equals(200);
          res.body.should.have.property("message");

          done();
        });
    });
  });
})

