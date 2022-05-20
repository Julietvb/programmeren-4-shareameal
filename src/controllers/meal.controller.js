const assert = require("assert");
const dbconnection = require("../../database/dbconnection");

let controller = {
  validateMeal: (req, res, next) => {
    let meal = req.body;
    let {
      name,
      description,
      isVega,
      isVegan,
      isToTakeHome,
      maxAmountOfParticipants,
      price,
    } = meal;

    try {
      assert(typeof name === "string", "Name must be a string");
      assert(typeof description === "string", "description must be a string");
      assert(typeof isVega === "boolean", "isVega must be a boolean");
      assert(typeof isVegan === "boolean", "isVegan must be a boolean");
      assert(
        typeof isToTakeHome === "boolean",
        "isToTakeHome must be a boolean"
      );
      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be a integer"
      );
      assert(typeof price === "number", "Price must be a double");
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
    next();
  },

  mealExists: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      const id = req.params.mealId;

      if (isNaN(id)) {
        return next();
      }
      connection.query(
        "SELECT COUNT(id) as count FROM meal WHERE id = ?",
        `${id}`,
        function (err, results, fields) {
          if (err) throw err;

          if (results[0].count === 0) {
            res.status(400).json({
              status: 400,
              message: "Meal does not exist",
            });
          } else {
              connection.query("SELECT cookId FROM meal WHERE id = ?", `${id}`, function (err, results, fields){
                  console.log(results)
                  req.cookId = results[0]
              })
            next();
          }
        }
      );
    });
  },

  addMeal: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      let meal = req.body;
      let cookId = req.userId;

      connection.query(
        "SELECT COUNT(name) as count FROM meal WHERE name = ?",
        meal.name,
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
              `INSERT INTO meal (isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, cookId, name, description) VALUES ('${meal.isVega}', '${meal.isVegan}', '${meal.isToTakeHome}', '${meal.maxAmountOfParticipants}', '${meal.price}', '${cookId}', '${meal.name}', '${meal.description}')`,
              function (error, results, fields) {
                if (error) throw error;
                if (results.affectedRows > 0) {
                  connection.query(
                    "SELECT * FROM meal WHERE name = ?",
                    meal.name,
                    function (error, results, fields) {
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
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  },

  getAllMeals: (req, res) => {
    let { name, isActive } = req.query;
    console.log(`name = ${name} isActive ${isActive}`);

    let queryString = "SELECT * FROM `meal`";
    if (name || isActive) {
      queryString += " WHERE ";
      if (name) {
        queryString += "`name` LIKE ?";
        name = "%" + name + "%";
      }
      if (name && isActive) {
        queryString += " AND ";
      }
      if (isActive) {
        queryString += `isActive = '${isActive}'`;
      }
    }

    console.log(queryString);

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        next(err);
      } // not connected!

      // Use the connection
      connection.query(
        queryString,
        [name, isActive],
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          console.log("#results = ", results.length);
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      );
    });
  },

  getMealById: (req, res, next) => {
    console.log("getmealById reached");
    dbconnection.getConnection(function (error, connection) {
      if (error) throw error;

      const mealId = req.params.mealId;

      if (isNaN(mealId)) {
        return next();
      }

      connection.query(
        "SELECT COUNT(id) as count FROM meal WHERE id =?",
        mealId,
        function (error, results, fields) {
          if (error) throw error;
          if (!results[0].count) {
            return next({
              status: 404,
              message: `Meal doesn't exist`,
            });
          } else {
            connection.query(
              "SELECT * FROM meal WHERE id = ?",
              mealId,
              function (error, results, fields) {
                if (error) throw error;

                connection.release();

                console.log("#results = ", results.length);
                res.status(200).json({
                  status: 200,
                  result: results[0],
                });
              }
            );
          }
        }
      );
    });
  },

  updateMeal: (req, res, next) => {
    //create connection
    dbconnection.getConnection((err, connection) => {
      //throw error if something went wrong
      if (err) throw err;

      //save parameter (id) in variable
      const mealId = req.params.id;

      const cookId = req.userId;

      if (isNaN(mealId)) {
        return next();
      }

      //set meal object with given request body
      const newmeal = req.body;

      connection.query(
        "SELECT * FROM meal WHERE id = ?",
        mealId,
        (err, results, fields) => {
          //throw error if something went wrong
          if (err) throw err;

          //store old data
          const oldmeal = results[0];

          if (cookId === oldmeal.cookId) {
            //if meal exists
            if (results[0]) {
              connection.query(
                "SELECT COUNT(name) as count FROM meal WHERE name = ? AND id <> ?",
                [newmeal.name, mealId],
                (err, results, fields) => {
                  //throw error if something went wrong
                  if (err) throw err;

                  //store if email is valid or not, can either be 0 or 1
                  const inValidMealName = results[0].count;

                  if (!inValidMealName) {
                    //put request body in a variable

                    const meal = {
                      ...oldmeal,
                      ...newmeal,
                    };

                    const {
                      name,
                      description,
                      id,
                      isActive,
                      isVega,
                      isVegan,
                      isToTakeHome,
                      maxAmountOfParticipants,
                      price,
                    } = meal;

                    //update meal
                    connection.query(
                      "UPDATE meal SET name = ?, description = ?, id = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?",
                      [
                        name,
                        description,
                        mealId,
                        isActive,
                        isVega,
                        isVegan,
                        isToTakeHome,
                        maxAmountOfParticipants,
                        price,
                        mealId,
                      ],
                      (err, results, fields) => {
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
                      }
                    );
                  } else {
                    //return false status if email is already in use by another meal
                    return next({
                      status: 409,
                      message: `Meal name already in use`,
                    });
                  }
                }
              );
            } else {
              return next({
                status: 403,
                message: `Can't update meal, no owner rights`,
              });
            }
          } else {
            //if the meal isn't found return a fitting error response
            return next({
              status: 404,
              message: `Meal doesn't exist`,
            });
          }
        }
      );
    });
  },

  deleteMeal: (req, res, next) => {
    console.log("deletemeal reached");
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const mealId = Number(req.params.mealId);
      const cookId = req.userId

      if (isNaN(mealId)) {
        next();
      }

      connection.query(
        `DELETE FROM meal WHERE id = '${mealId}'`,
        function (error, results, fields) {
          connection.release();

          if (error) throw error;

          console.log("#results = ", results.length);
          res.status(200).json({
            status: 200,
            message: "Meal has been deleted",
          });

          res.end();
        }
      );
    });
  },
};

module.exports = controller;
