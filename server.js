var express = require("express");
var app = express();
var port = process.env.PORT || 4000;
const mysql = require(`mysql-await`);
var session = require("express-session");
var router = express.Router();
var path = require("path");
var { request } = require("http");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var SetInterval = require("set-interval");
var SteamUser = require("steam-user");
var SteamTotp = require("steam-totp");
var {
  InvalidPassword,
  RateLimitExceeded,
} = require("steam-user/enums/EResult");
var { restart } = require("nodemon");
var bcrypt = require("bcryptjs");
require("console-stamp")(console, { format: ":date(HH:MM:ss)" });
var { makeid, encrypt, decrypt } = require("./views/public/js/functions");
var { fail } = require("assert");

var checkUserPlanAndVariables = require("./functions/checkUser.js");
app.use(flash());
app.use(
  session({
    secret: makeid(10),
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./views/public")));
app.use(express.static("./views/public"));
app.use("/css", express.static(__dirname + "./views/public/css"));
app.use("/js", express.static(__dirname + "./views/public/js"));
app.use("/img", express.static(__dirname + "./views/public/img"));

app.use(cookieParser("NotSoSecret"));


app.set("views", "./views/pages");
app.set("view engine", "ejs");

// Mysql
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myhourboost",
});

//
// START OF PAGES
//

// index page
app.get("/", function (req, res) {
  res.render("index", {
    page_name: "index",
    username: req.session.username,
    alert: req.flash("alert"),
  });
});

// about page
app.get("/features", function (req, res) {
  res.render("features", {
    page_name: "features",
    username: req.session.username,
  });
});

// pricing page
app.get("/pricing", function (req, res) {
  res.render("pricing", {
    page_name: "pricing",
    username: req.session.username,
  });
});

// support page
app.get("/support", function (req, res) {
  res.render("support", {
    page_name: "support",
    username: req.session.username,
  });
});

// login page
app.get("/login", function (req, res) {
  res.render("login", {
    page_name: "login",
    username: req.session.username,
    alert: req.flash("alert"),
  });
});

// register page
app.get("/register", function (req, res) {
  res.render("register", {
    page_name: "register",
    username: req.session.username,
    alert: req.flash("alert"),
  });
});

// app page

// Use the checkUserPlanAndVariables() function in the route
app.get("/app", (req, res) => {
  checkUserPlanAndVariables(req.session.username, function (result) {
    // Get the user type and the variables from the result
    const userType = result.userType;
    const variables = result.variables;

    //   console.log(variables.steamUsernameFree)
    //   console.log(variables.steamUsernamePremium)
    // Do something with the user type and the variables
    if (userType === "Free") {
      // Show the free version of the app
      res.render("app_test", {
        variables,
        alert: req.flash("alert"),
        username: req.session.username,
        page_name: "app",
      });
    } else if (userType === "Premium") {
      // Show the premium version of the app
      res.render("app_test", {
        variables,
        alert: req.flash("alert"),
        username: req.session.username,
        page_name: "app",
      });
    } else {
      // Show an error message
      res.send("Error: Unknown user plan");
    }
  });
});
//
// END OF PAGES
//

app.post("/api/auth", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myhourboost",
  });
  // Capture the input fields
  let username = req.body.username;
  let password = req.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          let pwResult = results[0].password;
          const verified = bcrypt.compareSync(password, pwResult);
          if (verified == true) {
            req.session.loggedin = true;
            req.session.username = username;
            req.flash("alert", "login_success");
            res.redirect("/app"); //had return
          } else {
            req.flash("alert", "incorrect_password");
            res.redirect("/login");
          }
        } else {
          req.flash("alert", "incorrect_username");
          res.redirect("/login");
        }
        res.end();
      }
    );
  } else {
    req.flash("alert", "no_user_and_password");
    res.redirect("/login");
    res.end();
  }
});
app.post("/api/register", function (req, res, next) {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myhourboost",
  });
  // Capture the input fields
  let username = req.body.username;
  let password = req.body.password;
  let email_input = req.body.email;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    //Check for user and pass input
    connection.query(
      "SELECT username FROM accounts WHERE username = ?",
      [username],
      function (error, result, fields) {
        if (result.length === 0) {
          if (email_input) {
            //Check for email input
            connection.query(
              "SELECT email FROM accounts",
              [username],
              function (error, result, fields) {
                if (result.length === 0 || result[0].email !== email_input) {
                  var sql =
                    "INSERT INTO accounts (username, password, email) VALUES (?)";
                  const passwordHash = bcrypt.hashSync(password, 10);
                  var values = [username, passwordHash, email_input];
                  var new_query = sql + values;

                  connection.query(sql, [values], function (error, result) {
                    if (error) console.log(error);
                  });

                  res.redirect("/login");
                } else {
                  req.flash("alert", "email_exist");
                  res.redirect("/register");
                  res.end();
                }
              }
            );
          } else {
            req.flash("alert", "no_email");
            res.redirect("/register");
            res.end();
          }
        } else {
          req.flash("alert", "user_exist");
          res.redirect("/register");
          res.end();
        }
      }
    );
  } else {
    req.flash("alert", "no_user_and_password");
    res.redirect("/register");
    res.end();
  }
});
app.get("/api/logout", function (req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(400).send("Unable to log out");
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.end();
  }
});

//Add Steam Account Free
app.post("/app/add_steamAccounts_Free", (req, res) => {
  let free_steam_username = req.body.SteamUsername;
  let free_steam_password = req.body.SteamPassword;
  // Ensure the input fields exists and are not empty
  if (free_steam_username && free_steam_password) {
    var sql =
      "INSERT INTO steamaccounts_free (username, steamUsernameFree, steamPasswordFree) VALUES (?, ?, ?)";

    var encryptedSteamPassword = encrypt(free_steam_password);

    var values = [
      req.session.username,
      free_steam_username,
      encryptedSteamPassword,
    ];
    connection.query(sql, values, function (error, result) {
      if (error) {
        console.log(error);
      }
    });

    var sql2 =
      "INSERT INTO steam_settings_free (username, steam_username) VALUES (?, ?)";
    var values2 = [req.session.username, free_steam_username];
    connection.query(sql2, values2, function (error, result) {
      if (error) {
        console.log(error);
      }
    });

    req.flash("alert", "free_steam_account_added");
    res.redirect("back");
  } else {
    //req.flash("alert", "no_free_steam_account_added")
    res.send("Please enter Username and Password!");
    res.end();
  }
});
//Add Steam Account Premium
app.post("/app/add_steam_account_premium", (req, res) => {
  let free_steam_username = req.body.SteamUsernamePremium;
  let free_steam_password = req.body.SteamPasswordPremium;
  // Ensure the input fields exists and are not empty
  if (free_steam_username && free_steam_password) {
    var sql =
      "INSERT INTO steamaccounts_premium (username, steamUsernamePremium, steamPasswordPremium) VALUES (?)";

    var encryptedSteamPassword = encrypt(free_steam_password);

    var values = [
      req.session.username,
      free_steam_username,
      encryptedSteamPassword,
    ];
    var new_query = sql + values;
    connection.query(sql, [values], function (error, result) {
      if (error) {
        console.log(error);
        return res.redirect("back");
      }
    });

    var sql2 =
      "INSERT INTO steam_settings_premium (username, steamUsernamePremium) VALUES (?)";

    var values2 = [req.session.username, free_steam_username];
    var new_query2 = sql2 + values2;
    connection.query(sql2, [values2], function (error, result) {
      if (error) {
        console.log(error);
        return res.redirect("back");
      }
    });

    req.flash("alert", "premium_steam_account_added");
    res.redirect("back");
  } else {
    //req.flash("alert", "no_free_steam_account_added")
    res.send("Please enter Username and Password!");
    res.end();
  }
});
//Remove Steam Account Free
app.post("/app/remove_steamAccounts_Free", (req, res) => {
  connection.query(
    "DELETE FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {}
  );
  connection.query(
    "DELETE FROM steam_settings_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {}
  );
  req.flash("alert", "remove_steam_account_free_success");
  res.redirect("back");
});
//Remove Steam Account Premium
app.post("/app/remove_steam_account_premium", (req, res) => {
  connection.query(
    "DELETE FROM steamaccounts_premium WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {}
  );
  connection.query(
    "DELETE FROM steam_settings_premium WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {}
  );
  req.flash("alert", "remove_steam_account_premium_success");
  return res.redirect("back");
});

//Store running steam accounts
let accounts = {};
const title = ["debugging app"];

//const games = [730]; // Add games id and separate them by comas [730, 440]

//Login to steam account free
function loginAccountFree(accountName, password, twoFactorCode, flash) {
  if (accounts[accountName]) {
    process.on("uncaughtException", function (Error) {
      console.log(`[!] ${accountName} is already running!`);
    });
  }

  let user = new SteamUser();
  accounts[accountName] = user;
  user.logOn({
    accountName,
    password,
    twoFactorCode,
  });
  connection.query(
    'UPDATE steamaccounts_free SET status="Starting..." WHERE steamUsernameFree = ?',
    [accountName],
    async function (error, result, fields) {}
  );
  process.on("uncaughtException", function (InvalidPassword) {
    console.log("[!] Invalid Password!");
    accounts[accountName].logOff();
    accounts[accountName] = null;
  });
  user.on("error", (e) => {
    switch (e.eresult) {
      case Steam.EResult.LoggedInElsewhere: {
        console.log(
          "Got kicked by other Steam session. Will log in shortly..."
        );
        logOn();
        return;
      }
      case Steam.EResult.RateLimitExceeded: {
        authenticated = false;
        onlyLogInAfter = Date.now() + 31 * 60 * 1000;
        console.log(
          "Got rate limited by Steam. Will try logging in again in 30 minutes."
        );
        return;
      }
      default: {
        panic(`Got an error from Steam: "${e.message}".`);
      }
    }
  });

  user.on("friendMessage", function (steamID, message) {
    connection.query(
      "SELECT * FROM steam_settings_free WHERE steamUsernameFree = ?",
      [accountName],
      async function (error, result, fields) {
        //console.log("Friend message from " + steamID.getSteam3RenderedID() + ": " + message);
        let afk_message_status = result[0].afk_message_status;
        let afk_message = result[0].afk_message;
        let afk_message_blocked = result[0].afk_message_blocked;
        let afk_message_full = afk_message_blocked + " " + afk_message;

        if (afk_message_status === "Disabled") {
          //pass
        } else if (afk_message_status === "Enabled") {
          user.chatMessage(steamID, afk_message_full);
        }
      }
    );
  });

  user.on("loggedOn", async () => {
    connection.query(
      "SELECT * FROM steam_settings_free WHERE steamUsernameFree = ?",
      [accountName],
      async function (error, result, fields) {
        let game1 = result[0].game1;
        let game2 = result[0].game2;
        let game3 = result[0].game3;
        let game4 = result[0].game4;
        let game5 = result[0].game5;
        let game6 = result[0].game6;
        const games = [game1, game2];

        await Array.prototype.push.apply(title, games);
        await user.setPersona(SteamUser.EPersonaState.Online);
        await user.gamesPlayed(title);
        console.log(`[!] Logged succesfully as ${accountName}.`);
        connection.query(
          'UPDATE steamaccounts_free SET status="Active" WHERE steamUsernameFree = ?',
          [accountName],
          async function (error, result, fields) {}
        );
      }
    );
  });
}

//Login to steam account premium
function loginAccountPremium(req, res, accountName, password, twoFactorCode) {
  if (accounts[accountName]) {
    process.on("uncaughtException", function (Error) {
      console.log(`[!] ${accountName} is already running!`);
    });
  }

  let user = new SteamUser();
  accounts[accountName] = user;
  user.logOn({
    accountName,
    password,
    twoFactorCode,
  });

  process.on("uncaughtException", function (InvalidPassword) {
    console.log("[!] Invalid Password!");
    accounts[accountName].logOff();
    accounts[accountName] = null;
  });
  process.on("uncaughtException", function (RateLimitExceeded) {
    console.log("[!] Rate limit exceeded. Try later!");
  });

  user.on("friendMessage", function (steamID, message) {
    connection.query(
      "SELECT * FROM steam_settings_premium WHERE steamUsernamePremium = ?",
      [accountName],
      async function (error, result, fields) {
        //console.log("Friend message from " + steamID.getSteam3RenderedID() + ": " + message);

        let afk_message_status = result[0].afk_message_status;
        let afk_message = result[0].afk_message;
        if (afk_message_status === "Disabled") {
          //pass
        } else if (afk_message_status === "Enabled") {
          user.chatMessage(steamID, afk_message);
        }
      }
    );
  });

  user.on("loggedOn", async () => {
    connection.query(
      "SELECT * FROM steam_settings_premium WHERE steamUsernamePremium = ?",
      [accountName],
      async function (error, result, fields) {
        let game1 = result[0].game1;
        let game2 = result[0].game2;
        let game3 = result[0].game3;
        let game4 = result[0].game4;
        let game5 = result[0].game5;
        let game6 = result[0].game6;
        const games = [game1, game2];

        await Array.prototype.push.apply(title, games);
        await user.setPersona(SteamUser.EPersonaState.Online);
        await user.gamesPlayed(title);
        console.log(`[!] Logged succesfully as ${accountName}.`);
        connection.query(
          'UPDATE steamaccounts_premium SET status="Active" WHERE steamUsernamePremium = ?',
          [accountName],
          async function (error, result, fields) {}
        );
      }
    );
  });
}
function testLogin(req, res, accountName, password, twoFactorCode) {
  if (accounts[accountName]) {
    process.on("uncaughtException", function (Error) {
      console.log(`[!] ${accountName} is already running!`);
    });
  }

  let user = new SteamUser();
  accounts[accountName] = user;
  user.logOn({
    accountName,
    password,
    twoFactorCode
  });
  process.on("uncaughtException", function (InvalidPassword) {
    console.log("[!] Invalid Password!");
    accounts[accountName].logOff();
    accounts[accountName] = null;
  });
  process.on("uncaughtException", function (RateLimitExceeded) {
    console.log("[!] Rate limit exceeded. Try later!");
  });

  user.on('steamGuard', (domain) => {
    if(domain == "email") {
      logoutAccount(accountName)
      req.flash("alert", "steamguard_required");
      res.redirect('back')
    }
    else if(domain == "phone") {
      logoutAccount(accountName)
      req.flash("alert", "steamguard_required");
      res.redirect('back')
    }else {
      logoutAccount(accountName)
      req.flash("alert", "steamguard_required");
       res.redirect('back')
    }
});
  
  user.on("loggedOn", async () => {
    connection.query(
      "SELECT * FROM steam_settings_free WHERE steamUsernameFree = ?",
      [accountName],
      async function (error, result, fields) {
        await Array.prototype.push.apply(title);
        await user.setPersona(SteamUser.EPersonaState.Online);
        await user.gamesPlayed(title);
        console.log(`[!] Logged succesfully as ${accountName}.`);
        connection.query(
          'UPDATE steamaccounts_free SET statusFree="Active" WHERE steamUsernameFree = ?',
          [accountName],
          async function (error, result, fields) {
            req.flash("alert", "bot_started")
            res.redirect("back")
          }
        );
      }
    );
  });
}

//Logout from a steam account
function logoutAccount(accountName) {
  if (!accounts[accountName]) {
    throw new Error(`No SteamUser for ${accountName}`);
  }
  
  accounts[accountName].logOff();
  accounts[accountName] = null;
}

app.post("/app/start/free/steamguard", async (req, res) => {
  try{
  const response = await connection.awaitQuery(
    "SELECT * FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      return result;
    }
    );
    if (response === undefined || response.length == 0) {
      // console.log("[!] No steam account added!");
      connection.query(
        'UPDATE steamaccounts_free SET statusFree="Inactive" WHERE username = ?',
        [req.session.username],
        function (error, result, fields) {}
      );
      req.flash("alert", "no_account_added")
      res.redirect("back");
    } else {
      let steamUsername = response[0].steamUsernameFree;
      let steamPassword = decrypt(response[0].steamPasswordFree);
      let steamguard = req.body.SteamGuard;
      // console.log(steamUsername);
      testLogin(req, res, steamUsername, steamPassword, steamguard);
      
    }  
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error 101");
    }
});

app.post("/debug/who_idle", (req, res) => {
  console.log(accounts);
});

// app.post("/app/start_free", (req, res) => {
//     connection.query("SELECT * FROM steamaccounts_free WHERE username = ?", [req.session.username], async function (error, result, fields) {

//         process.on("uncaughtException", function (error) {
//             console.log(`[!] Error - ${error}`);
//             console.log("Error at start_free in index.js!");
//         });

//         if (result.length === 0) {
//             console.log("[!] No steam account added!");
//             connection.query('UPDATE steamaccounts_free SET status="Inactive" WHERE username = ?', [req.session.username], function (error, result, fields) {});
//             res.redirect("back");
//         } else {

//             let steamUsername = result[0].steam_username;
//             let steamPassword = decrypt(result[0].steam_password);
//             let steamguard = req.body.SteamGuard;
//             let accountName = steamUsername;
//             let password = steamPassword;
//             let twoFactorCode = steamguard;

//             connection.query("SELECT * FROM accounts WHERE username = ?", [req.session.username], function (error, result, fields) {
//                 if(error) console.log(error);

//                 if (result.length === 0){

//                 }else{
//                     let timeleft_free = result[0].timeleft_free;

//                     if (timeleft_free === 0){
//                         req.flash("saveSettings", "noTimeLeft")
//                         res.redirect("back");

//                     }else{

//                     //loginAccountFree(steamUsername, steamPassword, steamguard);
//                     //start

//                     if (accounts[accountName]) {

//                     }

//                     let user = new SteamUser();
//                     accounts[accountName] = user;
//                     user.logOn({
//                         accountName,
//                         password,
//                         twoFactorCode,
//                     });

//                     //connection.query('UPDATE steamaccounts_free SET status="Steamguard" WHERE steam_username = ?', [accountName], async function (error, result, fields) {});

//                     user.on("steamGUard", (callback) => {
//                         connection.query('UPDATE steamaccounts_free SET status="Steamguard" WHERE steamUsernameFree = ?', [accountName], async function (error, result, fields) {});
//                         //res.redirect("back")
//                     });

//                     user.on("error", (err) => {
//                         if (err == "Error: RateLimitExceeded") {
//                             console.log(accountName + ' - rate limit');

//                         }
//                         else if (err == "Error: InvalidPassword") {
//                             console.log(accountName + ' - bad password');
//                         }
//                         else if (err == "Error: LoggedInElsewhere") {
//                             console.log(accountName + " already logged in")
//                         }
//                         else {
//                             console.log(accountName + ' - ERROR');

//                         }
//                     });

//                     user.on('friendMessage', function(steamID, message) {

//                         connection.query("SELECT * FROM steam_settings_free WHERE steamUsernameFree = ?", [accountName], async function (error, result, fields) {

//                         //console.log("Friend message from " + steamID.getSteam3RenderedID() + ": " + message);

//                             let afk_message_status = result[0].afk_message_status;
//                             let afk_message = result[0].afk_message;
//                             let afk_message_blocked = result[0].afk_message_blocked;
//                             let afk_message_full = afk_message_blocked + " " + afk_message;

//                             if (afk_message_status === "Disabled"){
//                                 //pass
//                             }else if (afk_message_status === "Enabled"){
//                                 user.chatMessage(steamID, afk_message_full)
//                             }

//                         });

//                     });

//                     user.on("loggedOn", async () => {

//                         connection.query("SELECT * FROM steam_settings_free WHERE steamUsernameFree = ?", [accountName], async function (error, result, fields) {

//                             let game1 = result[0].game1;
//                             let game2 = result[0].game2;
//                             let game3 = result[0].game3;
//                             let game4 = result[0].game4;
//                             let game5 = result[0].game5;
//                             let game6 = result[0].game6;
//                             const games = [game1, game2];

//                             await Array.prototype.push.apply(title, games);
//                             await user.setPersona(SteamUser.EPersonaState.Online);
//                             await user.gamesPlayed(title);
//                             console.log(`[!] Logged succesfully as ${accountName}.`);
//                             connection.query('UPDATE steamaccounts_free SET status="Active" WHERE steamUsernameFree = ?', [accountName], async function (error, result, fields) {});
//                             res.redirect("back");

//                         });

//                     });

//                     //end

//                     function callback(){
//                         connection.query('UPDATE accounts SET timeleft_free = timeleft_free - 5 WHERE username = ?', [req.session.username], function (error, result, fields) {});
//                         //console.log("5 minutes passed!");
//                         //comment this console log if you don't want to track every time when the database changes
//                     }

//                     SetInterval.start(callback, 300 * 1000, 'freeAccount')
//                     // set interval every 5 minutes => 300 seconds
//                     //recommend you to use a higher interval, like 15+ minutes.

//                     // connection.query('UPDATE steamaccounts_free SET status="Active" WHERE username = ?', [req.session.username], function (error, result, fields) {});

//                     // res.redirect("back");
//                     };

//                 }

//             });

//         }
//     });
//     // res.redirect("back");

// });
app.post("/app/start/free", async (req, res) => {
  try{
  const getSteamAccount = await connection.awaitQuery(
    "SELECT * FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      return result;
    }
  );
  if (getSteamAccount === undefined || getSteamAccount.length == 0) {
    // console.log("[!] No steam account added!");
    connection.query(
      'UPDATE steamaccounts_free SET statusFree="Inactive" WHERE username = ?',
      [req.session.username],
      function (error, result, fields) {}
    );
    req.flash("alert", "no_account_added")
    return res.redirect("back")
  } else {
    let steamUsername = getSteamAccount[0].steamUsernameFree;
    let steamPassword = decrypt(getSteamAccount[0].steamPasswordFree);
    let steamguard = req.body.SteamGuard;
    // console.log(steamUsername);
    testLogin(req, res, steamUsername, steamPassword);

  }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error 100");
  }
});

app.post("/app/stop/free", (req, res) => {
  connection.query(
    "SELECT * FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      if (error) {
        console.log(error);
        return res.redirect("back");
      }
      if (result.length === 0) {
        console.log("[!] No steam account added!");
        return res.redirect("back");
      } else {
        let steamUsername = result[0].steamUsernameFree;
        logoutAccount(steamUsername)
        connection.query(
          'UPDATE steamaccounts_free SET statusFree="Inactive" WHERE username = ?',
          [req.session.username],
          function (error, result, fields) {}
        );

        SetInterval.clear("freeAccount");
        //stopping the interval
        req.flash('alert', 'bot_stopped')
        return res.redirect("back");
      }
    }
  );
  
});

app.post("/app/save_settings_free", (req, res) => {
  //connection.query("DELETE FROM steamaccounts_free WHERE username = ?", [req.session.username], function (error, result, fields) {});
  let checkbox_req = req.body.checkbox;
  let afk_msg_body = req.body.afk_msg;

  connection.query(
    "SELECT * FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      if (error) {
        console.log(error);
      }

      if (result.length === 0) {
        req.flash("alert", "no_account_added");
        return res.redirect("back");
      } else {
        if (afk_msg_body === "") {
          //console.log("[DEBUG] Afk message can't be empty! ")
          req.flash("alert", "empty_message");
        } else {
          //console.log("[DEBUG] Afk message updated to: " + afk_msg_body)
          connection.query(
            "UPDATE steam_settings_free SET afk_message = ?",
            [afk_msg_body],
            function (error, result, fields) {}
          );
          req.flash("alert", "settings_saved_successfully");
        }

        if (checkbox_req) {
          //console.log("[DEBUG] true");
          connection.query(
            "UPDATE steam_settings_free SET afk_message_status = ?",
            ["Enabled"],
            function (error, result, fields) {}
          );
        } else {
          //console.log("[DEBUG] false");
          connection.query(
            "UPDATE steam_settings_free SET afk_message_status = ?",
            ["Disabled"],
            function (error, result, fields) {}
          );
        }
        return res.redirect("back");
      }
    }
  );
});

app.post("/app/start_premium", (req, res) => {
  connection.query(
    "SELECT * FROM steamaccounts_premium WHERE username = ?",
    [req.session.username],
    async function (error, result, fields) {
      process.on("uncaughtException", function (error) {
        console.log(`[!] Error - ${error}`);
        console.log("Error at start_free in index.js!");
      });
      if (result.length === 0) {
        console.log("[!] No steam account added!");
        connection.query(
          'UPDATE steamaccounts_premium SET status="Inactive" WHERE username = ?',
          [req.session.username],
          function (error, result, fields) {}
        );
        res.redirect("back");
      } else {
        let steamUsername = result[0].steam_username;
        let steamPassword = decrypt(result[0].steam_password);
        let steamguard = req.body.SteamGuard;

        connection.query(
          "SELECT * FROM accounts WHERE username = ?",
          [req.session.username],
          function (error, result, fields) {
            if (error) console.log(error);

            if (result.length === 0) {
            } else {
              let timeleft_premium = result[0].timeleft_premium;

              if (timeleft_premium === 0) {
                req.flash("saveSettings", "noTimeLeft");
                res.redirect("back");
              } else {
                loginAccountPremium(steamUsername, steamPassword, steamguard);

                function callback() {
                  connection.query(
                    "UPDATE accounts SET timeleft_premium = timeleft_premium - 5 WHERE username = ?",
                    [req.session.username],
                    function (error, result, fields) {}
                  );
                  //console.log("5 minutes passed!");
                  //comment this console log if you don't want to track every time when the database changes
                }

                SetInterval.start(callback, 300 * 1000, "premiumAccount");
                // set interval every 5 minutes => 300 seconds
                //recommend you to use a higher interval, like 15+ minutes.

                connection.query(
                  'UPDATE steamaccounts_premium SET status="Active" WHERE username = ?',
                  [req.session.username],
                  function (error, result, fields) {}
                );
                res.redirect("back");
              }
            }
          }
        );
      }
    }
  );
});
app.post("/app/stop_premium", (req, res) => {
  connection.query(
    "SELECT * FROM steamaccounts_premium WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      if (error) {
        console.log(error);
        return res.redirect("back");
      }
      if (result.length === 0) {
        console.log("[!] No steam account added!");
        return res.redirect("back");
      } else {
        let steamUsername = result[0].steam_username;
        logoutAccount(steamUsername);
        connection.query(
          'UPDATE steamaccounts_premium SET status="Inactive" WHERE username = ?',
          [req.session.username],
          function (error, result, fields) {}
        );

        SetInterval.clear("premiumAccount");
        //stopping the interval
        return res.redirect("back");
      }
    }
  );
});
app.post("/app/steamguard_premium", (req, res) => {
  connection.query(
    "SELECT * FROM steamaccounts_free WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      if (error) {
        console.log(error);
      }
      let steamUsername = result[0].steam_username;
      let steamPassword = result[0].steam_password;
      let steamguard = req.body.SteamGuard;
      if (result.length === 0) {
        console.log("[!] No steam account added");
      } else {
        user.logOn({
          accountName: steamUsername,
          password: steamPassword,
          twoFactorCode: steamguard,
        });
        process.on("uncaughtException", function (InvalidPassword) {
          console.log("[!] Invalid Password!");
        });
        process.on("uncaughtException", function (RateLimitExceeded) {
          console.log("[!] Rate limit exceeded. Try later!");
        });
        connection.query(
          'UPDATE steamaccounts_free SET status="Started" WHERE username = ?',
          [req.session.username],
          function (error, result, fields) {}
        );
        return res.redirect("back");
      }
    }
  );
});
app.post("/app/save_settings_premium", (req, res) => {
  //connection.query("DELETE FROM steamaccounts_free WHERE username = ?", [req.session.username], function (error, result, fields) {});
  let checkbox_req = req.body.checkbox;
  let afk_msg_body = req.body.afk_msg;

  connection.query(
    "SELECT * FROM steamaccounts_premium WHERE username = ?",
    [req.session.username],
    function (error, result, fields) {
      if (error) {
        console.log(error);
      }

      if (result.length === 0) {
        req.flash("alert", "no_account_added");
        return res.redirect("back");
      } else {
        if (afk_msg_body === "") {
          //console.log("[DEBUG] Afk message can't be empty! ")
          req.flash("alert", "empty_message");
        } else {
          //console.log("[DEBUG] Afk message updated to: " + afk_msg_body)
          connection.query(
            "UPDATE steam_settings_premium SET afk_message = ?",
            [afk_msg_body],
            function (error, result, fields) {}
          );
          req.flash("alert", "settings_saved_successfully");
        }

        if (checkbox_req) {
          //console.log("[DEBUG] true");
          connection.query(
            "UPDATE steam_settings_premium SET afk_message_status = ?",
            ["Enabled"],
            function (error, result, fields) {}
          );
        } else {
          //console.log("[DEBUG] false");
          connection.query(
            "UPDATE steam_settings_premium SET afk_message_status = ?",
            ["Disabled"],
            function (error, result, fields) {}
          );
        }
        return res.redirect("back");
      }
    }
  );
});

//404 error for unavailable page
app.get("/404", (req, res) => {
  res.render("404", {
    page_name: "404",
    username: req.session.username,
  });
});

app.get("*", (req, res) => {
  res.redirect("/404");
});

app.listen(port);
console.log("Server is listening on port: " + port);
function resetAllAccountsStatus() {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myhourboost",
  });
  connection.query(
    "SELECT * FROM steamaccounts_free",
    function (error, result, fields) {
      if (error) throw error;

      if (result.length === 0) {
        console.info(`[!] No free steam account added!`);
      } else {
        connection.query(
          'UPDATE steamaccounts_free SET statusFree="Inactive" WHERE id > 0',
          function (error, result, fields) {}
        );
        console.info(`[!] Free steam account status reseted!`);
      }
    }
  );

  connection.query(
    "SELECT * FROM steamaccounts_premium",
    function (error, result, fields) {
      if (result.length === 0) {
        console.info(`[!] No premium steam account added!`);
      } else {
        connection.query(
          'UPDATE steamaccounts_premium SET statusPremium="Inactive" WHERE id > 0',
          function (error, result, fields) {}
        );
        console.info(`[!] Premium steam account status reseted!`);
      }
    }
  );
}
resetAllAccountsStatus();
