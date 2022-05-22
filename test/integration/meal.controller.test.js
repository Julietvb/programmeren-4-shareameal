process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const jwt = require('jsonwebtoken')
const { jwtSecretKey } = require("../../src/config/config");
chai.should();
chai.use(chaiHttp);

let mealId;

describe("Manage meals /api/meal", () => {
  describe("TC-301-1 add a meal", () => {
    it("Name missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
          //Name missing
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
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

    it("MaxParticipants missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
          //MaxParticipants missing
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
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
            .that.equals("maxAmountOfParticipants must be a integer");
          done();
        });
    });

    it("Price missing or invalid, return valid error", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
          //Price missing
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
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

    it("TC-301-4 Meal already exists", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Friet van de Toren",
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

    it("TC-301-5 Meal has been registered succesfully", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          maxAmountOfParticipants: 2,
          price: 6.0,
          name: "Boerenkool met worst",
          description:
            "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

        //   console.log(res.body);

          //store id for delete test
          mealId = result.id;

          status.should.equals(201);
          done();
        });
    });
  });

  describe("UC-305 Update meal", () => {
    it("TC-305-1 Name missing", (done) => {
      chai.request(server)
        .put("/api/meal/1")
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .send({
        //Name missing
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
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

    it("TC-305-4 meal ID doesn't exist", (done) => {
        chai.request(server)
            .put("/api/meal/0")
            .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
            .send({
              isVega: false,
              isVegan: false,
              isToTakeHome: true,
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

    it("TC-205-6 meal updated succesfully", (done) => {
        chai.request(server)
            .put("/api/meal/" + mealId)
            .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
            .send({
                firstName: "Jan",
                lastName: "Joker",
                isActive: true,
                emailAdress: `janjoker@gmail.com`,
                password: "secret",
                phoneNumber: "0612345678",
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

      // UC-304 Get all meals
      describe("UC-303 Get all meals", () => {
        // it("TC-204-1 Invalid token");
        it("TC-304-2 get all meals", (done) => {
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
      // it("TC-204-1 Invalid token");
      it("TC-304-2 meal ID doesn't exist", (done) => {
        chai.request(server)
          .get("/api/meal/0")
          .end((req, res) => {
            let { status } = res.body;
            status.should.equals(404);
            done();
          });
      });
      it("TC-204-3 meal ID exists", (done) => {
        chai
          .request(server)
          .get("/api/meal/" + mealId)
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
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .end((req, res) => {
          let { status } = res.body;
          status.should.equals(400);
          done();
        });
    });

    it("TC-305-4 Meal deleted successfully", (done) => {
      chai
        .request(server)
        .delete("/api/meal/" + mealId)
        .set('authorization', 'Bearer ' + jwt.sign({id : 1}), jwtSecretKey)
        .end((req, res) => {
          let { status } = res.body;

          status.should.equals(200);
          res.body.should.have.property("message");

          done();
        });
    });
  });
})

