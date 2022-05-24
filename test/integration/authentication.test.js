const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const {
    expect
} = require('chai');
chai.should();
chai.expect();
chai.use(chaiHttp);

let token;
let wrongToken;

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

describe('UC-1 login', () => {
    beforeEach((done) => {
        dbconnection.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(CLEAR_DB + INSERT_USER + INSERT_MEALS, (err, results, fields) => {
                if (err) throw err;
                connection.release();
                done();
            });
        });
    })

    describe('UC-101 login', () => {
        it('TC-101-1 Mandatory field is missing', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Email must be a string')
                    done()
                })
        })

        it('TC-101-2 Invalid email address', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "invalidgmail.com",
                    password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Invalid email format')
                    done()
                })
        })

        it('TC-101-3 Invalid password', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "test@mail.com",
                    password: "no",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(400)
                    message.should.be.a('string').that.equals('Invalid password format')
                    done()
                })
        })

        it('TC-101-4 User does not exist', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "bez@mail.com",
                    password: "secret",
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'message')

                    let {
                        status,
                        message
                    } = res.body
                    status.should.be.a('number').that.equals(404)
                    message.should.be.a('string').that.equals('Email not found')
                    done()
                })
        })

        it('TC-101-5 User logged in succesfully', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "m.vandullemen@server.nl",
                    password: "secret"
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('status', 'result')

                    let {status, result} = res.body

                    expect(status).to.equal(200)
                    expect(result.id).to.equal(1)
                    expect(result.firstName).to.equal('Mariëtte');
                    expect(result.lastName).to.equal('van den Dullemen');
                    expect(result.emailAdress).to.equal('m.vandullemen@server.nl');
                    
                    done()
                })
        })
    })
})