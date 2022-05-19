const assert = require('assert');
// const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')

let controller = {

    mealExists: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            const id = req.params.mealId;

            if(isNaN(id)){ 
                return next()
            } 
            connection.query(
                'SELECT COUNT(id) as count FROM meal WHERE id = ?', `${id}`,
                function (err, results, fields) {

                    if (err) throw err;

                    if (results[0].count === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "Meal does not exist",
                        });
                    } else {
                        next();
                    }
                });
        });
    },

    addMeal:(req, res) => {
   
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let meal = req.body;

            connection.query(
                'SELECT COUNT(name) as count FROM meal WHERE bane = ?', meal.emailAdress,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    if (results[0].count > 0) {
                        res.status(409).json({
                            status: 409,
                            message: `Meal name is already in use.`,
                        });
                    } else {
                        connection.query(
                            `INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, ) VALUES ('${meal.firstName}', '${meal.lastName}', '${meal.street}', '${meal.city}', '${meal.password}', '${meal.emailAdress}')`,
                            function (error, results, fields) {       
                                if (error) throw error;
                                if (results.affectedRows > 0) {

                                connection.query("SELECT * FROM meal WHERE emailAdress = ?", meal.emailAdress, function(error, results, fields) {
                                    if (error) throw error;
                                    connection.release();

                                    if (results[0].isActive === 1) {
                                        results[0].isActive = true;
                                    } else {
                                        results[0].isActive = false;
                                    }

                                    res.status(201).json({
                                        status: 201,
                                        result: results[0],
                                    });
                                })
                                                          
                                }
                            });
                    }
                });
        });
    },

    getAllmeals:(req, res) => {
        let {firstName, isActive} = req.query
        console.log(`name = ${firstName} isActive ${isActive}`)

        let queryString = 'SELECT * FROM `meal`'
        if (firstName || isActive) {
            queryString += ' WHERE '
            if (firstName) {
                queryString += '`firstName` LIKE ?'
                firstName = '%' + firstName + '%'
            }
            if (firstName && isActive) {
                queryString += ' AND '
            }
            if (isActive) {
                queryString += `isActive = '${isActive}'`
            }
        }

        console.log(queryString);

        dbconnection.getConnection(function(err, connection) {
            if (err){
                next(err)
            }; // not connected!
           
            // Use the connection
            connection.query(queryString, [firstName, isActive], function (error, results, fields) {
              // When done with the connection, release it.
              connection.release();
           
              // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the pool.
              console.log('#results = ', results.length)
              res.status(200).json({
                  statusCode: 200,
                  result: results
              })
        
            });
        });
    },

    getmealProfile:(req, res) => {
        res.status(200).json({
            code: 200,
            message: "This functionality hasn't been added yet.",
        });
    },

    getmealById:(req, res, next) => {
        console.log("getmealById reached");
        dbconnection.getConnection(function (error, connection) {
            if (error) throw error;

            const mealId = req.params.mealId

            if(isNaN(mealId)) {
                return next();
            }

            connection.query("SELECT COUNT(id) as count FROM meal WHERE id =?", mealId,  function (error, results, fields) {
                if (error) throw error;
                if(!results[0].count) {
                    return next({
                        status: 404,
                        message: `meal doesn't exist`,
                    });
                } else {
                    connection.query( 'SELECT * FROM meal WHERE id = ?', mealId, function (error, results, fields) {
                        if (error) throw error;
                        
                        connection.release();
    
                        console.log('#results = ', results.length);
                        res.status(200).json({
                            status: 200,
                            result: results[0],
                        });
                    });
                }
            });
        });
    },

    updatemeal:(req, res, next) => {
        //create connection
        dbconnection.getConnection((err, connection) => {
            //throw error if something went wrong
            if (err) throw err;
    
            //save parameter (id) in variable
            const id = Number(req.params.id);
    
            const newmeal = req.body;
    
            //check if parameter is a number
            if (isNaN(id)) {
                return next();
            }
    
            //set meal object with given request body
            let meal = req.body;
    
            connection.query("SELECT * FROM meal WHERE id = ?", id, (err, results, fields) => {
                //throw error if something went wrong
                if (err) throw err;
    
                //store old data
                const oldmeal = results[0];
    
                //if meal exists
                if (results[0]) {
                    connection.query("SELECT COUNT(emailAdress) as count FROM meal WHERE emailAdress = ? AND id <> ?", [oldmeal.emailAdress, id], (err, results, fields) => {
                        //throw error if something went wrong
                        if (err) throw err;
    
                        //store if email is valid or not, can either be 0 or 1
                        const unValidEmail = results[0].count;
    
                        if (!unValidEmail) {
                            //put request body in a variable
    
                            const meal = {
                                ...oldmeal,
                                ...newmeal,
                            };
    
                            const { firstName, lastName, emailAdress, password, street, city } = meal;
    
                            //update meal
                            connection.query("UPDATE meal SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ?", [firstName, lastName, emailAdress, password, street, city, id], (err, results, fields) => {
                                //throw error if something went wrong
                                if (err) throw err;
    
                                //close connection
                                connection.release();
    
                                //return successful status + updated meal
                                res.status(200).json({
                                    status: 200,
                                    result: meal,
                                });
    
                                //end response process
                                // res.end();
                            });
                        } else {
                            //return false status if email is already in use by another meal
                            return next({
                                status: 409,
                                message: `Email is already in use`,
                            });
                        }
                    });
                } else {
                    //if the meal isn't found return a fitting error response
                    return next({
                        status: 400,
                        message: `meal doesn't exist`,
                    });
                }
            });
        });
},

/*         const mealId = req.params.id;
        let meal = req.body;
    
        newmeal = {
          mealId,
          ...meal,
        }
    
        let selectedmeal = database.filter((item) => item.id == mealId);
    
        if (selectedmeal != null && validEmail) {
          index = database.findIndex((obj) => obj.id == mealId);
          database[index] = newmeal;
    
          res.status(201).json({
              status: 201,
              result: `meal ${mealId} succesfully updated.`,
          });
        } else if (selectedmeal != null && !validEmail) {
          res.status(400).json({
          status: 400,
          message: `Email is already in use.`,
          });
        } else {
            const error = {
                status: 400,
                result: `meal with ID ${mealId} not found`,
            }
            next(error);
        } */

    deletemeal:(req, res, next) => {
        console.log("deletemeal reached");
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const mealId = Number(req.params.mealId);

            if (isNaN(mealId)) {
                next()
            }

            connection.query(
                `DELETE FROM meal WHERE id = '${mealId}'`,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200,
                        message: "meal has been deleted",
                    });

                    res.end();
                });

        });
    },

/*         const mealId = Number(req.params.mealId);
        let meal = database.filter((item) => item.id === mealId);
    
        if (meal.length > 0) {
            //make new array with all meals except selected
            database = database.filter((item) => item.id !== mealId);
    
            res.status(200).json({
                status: 200,
                message: `meal ${mealId} succesfully removed`,
            });
        } else {
            const error = {
                status: 400,
                result: `meal with ID ${mealId} not found`,
            }
            next(error);
        }
    } */
}

module.exports = controller;