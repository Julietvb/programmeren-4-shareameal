const jwt = require("jsonwebtoken");

const privateKey = "secretstring";

jwt.sign(
  { userId : 1 },
  privateKey,
  function (err, token) {
    if (err) console.log(err)
    if(token) console.log(token);
  }
);
