const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const jwt = require("jsonwebtoken");
const logger = require('../config/config').logger


let controller = {
    login:(req, res, next) => {
        //Assert voor validatie
        const {emailAdress, password} = req.body

        const queryString  = 'SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?'

        dbconnection.getConnection(function(err, connection) {
            if (err){
                next(err)
            }; // not connected!
           
            // Use the connection
            connection.query(queryString, [emailAdress], function (error, results, fields) {
              // When done with the connection, release it.
              connection.release();
           
              // Handle error after the release.
              if (error) throw error;
           

              if (results && results.length === 1) {
                  //user gevonden met meegekregen email
                  //Check password
                  console.log(results)

                  const user = results[0]
                  if (user.password === password) {
                      //email en password correct
                      jwt.sign({userId: user.id}, process.env.JWT_SECRET, { expiresIn: '30d' }, function (err, token) {
                          if (err) console.log(err)
                          if(token) {
                              console.log(token)
                              res.status(200).json({
                                  status: 200,
                                  result: {...user, token}
                              })
                          }
                        }
                      );
                  } else {
                      //password incorrect
                      res.status(400).json({
                        status: 400,
                        message: 'Incorrect password'
                    })
                  }
              } else {
                  console.log('User not found')
                  res.status(404).json({
                      status: 404,
                      message: 'Email not found'
                  })
              }
            });
        });
    },

    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        try {
            assert(
                typeof req.body.emailAdress === 'string',
                'email must be a string.'
            )
            assert(
                typeof req.body.password === 'string',
                'password must be a string.'
            )
            next()
        } catch (ex) {
            res.status(422).json({
                status: 422,
                message: ex.toString(),
                datetime: new Date().toISOString(),
            })
        }
    },

    validate:(req, res, next) => {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.warn('Niet ingelogd!')
            res.status(401).json({
                status: 401,
                error: 'Not logged in!',
                datetime: new Date().toISOString(),
            })
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized')
                    res.status(401).json({
                        status: 401,
                        error: 'Not authorized',
                        datetime: new Date().toISOString(),
                    })
                }
                if (payload) {
                    console.log('token is valid', payload)
                    // User heeft toegang. Voeg UserId uit payload toe aan
                    // request, voor ieder volgend endpoint.
                    req.userId = payload.userId
                    next()
                }
            })
        }
    }
}

module.exports = controller;