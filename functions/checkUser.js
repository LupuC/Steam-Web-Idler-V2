var mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myhourboost",
  });

// normal version of checkUserPlanAndVariables function
// function checkUserPlanAndVariables(username, callback) {

// 	// Query the database to get the user's plan
// 	const query = `SELECT * FROM accounts WHERE username = '${username}'`;

// 	connection.query(query, function(error, result) {
// 		if (error) throw error;
// 		if (result.length > 0) {
// 			// Define the userType variable as a local variable
// 			// (without using the var keyword)
// 			userType = result[0].plan;
// 			steamTimeleftFree = result[0].timeleft_free;
// 			steamTimeleftPremium = result[0].timeleft_premium;

// 			// Function to check the user's variables
// 			function checkUserVariables(userType, username, callback) {
// 				// Query the database to get the variables
// 				let query = '';
// 				if (userType === 'Premium') {
// 					// Query the steamaccounts_free table
// 					let queryFree = `SELECT * FROM steamaccounts_free WHERE username = '${username}'`;
// 					connection.query(queryFree, function(error, resultFree) {
// 						if (error) throw error;

// 						// Query the steamaccounts_premium table
// 						let queryPremium = `SELECT * FROM steamaccounts_premium WHERE username = '${username}'`;
// 						connection.query(queryPremium, function(error, resultPremium) {
// 							if (error) throw error;

// 							// Check if there is a result from the database
// 							if (resultFree.length > 0 && resultPremium.length > 0) {

// 								// Get the variables from the database result
// 								const steamUsernameFree = resultFree[0].steamUsernameFree;
// 								const steamPasswordFree = resultFree[0].steamPasswordFree;
// 								const statusFree = resultFree[0].statusFree;

// 								const steamUsernamePremium = resultPremium[0].steamUsernamePremium;
// 								const steamPasswordPremium = resultPremium[0].steamPasswordPremium;
// 								const statusPremium = resultPremium[0].statusPremium;
// 								//
// 								//
// 								//
// 								//add a query for free and premium steam settings
// 								queryFreeSettings = `SELECT * FROM steam_settings_free WHERE username = '${username}'`;
// 								connection.query(queryFreeSettings, function(error, resultFreeSettings) {
// 									if (error) throw error;
// 									if (resultFreeSettings) {
// 										queryPremiumSettings = `SELECT * FROM steam_settings_premium WHERE username = '${username}'`;
// 										connection.query(queryFreeSettings, function(error, resultPremiumSettings) {
// 											if (resultPremiumSettings) {
// 												const game1Free = resultFreeSettings[0].game1;
// 												const game2Free = resultFreeSettings[0].game2;
// 												const gameTitleFree = resultFreeSettings[0].title;
// 												const checkboxFree = resultFreeSettings[0].afk_message_status;
// 												const afkMessageFree = resultFreeSettings[0].afk_message;

// 												const game1Premium = resultPremiumSettings[0].game1;
// 												const game2Premium = resultPremiumSettings[0].game2;
// 												const gameTitlePremium = resultPremiumSettings[0].title;
// 												const checkboxPremium = resultPremiumSettings[0].afk_message_status;
// 												const afkMessagePremium = resultPremiumSettings[0].afk_message;

// 												callback({
// 													steamUsernameFree,
// 													steamPasswordFree,
// 													statusFree,
// 													steamUsernamePremium,
// 													steamPasswordPremium,
// 													statusPremium,
// 													game1Free,
// 													game2Free,
// 													gameTitleFree,
// 													checkboxFree,
// 													afkMessageFree,
// 													game1Premium,
// 													game2Premium,
// 													gameTitlePremium,
// 													checkboxPremium,
// 													afkMessagePremium
// 												});
// 											} else {
// 												const game1Free = "";
// 												const game2Free = "";
// 												const gameTitleFree = "";
// 												const checkboxFree = "";
// 												const afkMessageFree = "";

// 												const game1Premium = "";
// 												const game2Premium = "";
// 												const gameTitlePremium = "";
// 												const checkboxPremium = "";
// 												const afkMessagePremium = "";

// 												callback({
// 													steamUsernameFree,
// 													steamPasswordFree,
// 													statusFree,
// 													steamUsernamePremium: "None",
// 													steamPasswordPremium: "None",
// 													statusPremium: "Inactive",
// 													game1Free,
// 													game2Free,
// 													gameTitleFree,
// 													checkboxFree,
// 													afkMessageFree,
// 													game1Premium,
// 													game2Premium,
// 													gameTitlePremium,
// 													checkboxPremium,
// 													afkMessagePremium
// 												});
// 											}

// 										});

// 									}

// 								});

// 								callback({
// 									steamUsernameFree,
// 									steamPasswordFree,
// 									statusFree,
// 									steamUsernamePremium,
// 									steamPasswordPremium,
// 									statusPremium,
// 									game1Free,
// 									game2Free,
// 									gameTitleFree,
// 									checkboxFree,
// 									afkMessageFree,
// 									game1Premium,
// 									game2Premium,
// 									gameTitlePremium,
// 									checkboxPremium,
// 									afkMessagePremium
// 								});

// 								//
// 								//
// 								//
// 								// Return the variables to the caller
// 							} else if (resultFree.length > 0 && resultPremium.length <= 0) {
// 								const steamUsernameFree = resultFree[0].steamUsernameFree;
// 								const steamPasswordFree = resultFree[0].steamPasswordFree;
// 								const statusFree = resultFree[0].statusFree;
// 								//
// 								//
// 								//
// 								queryFreeSettings = `SELECT * FROM steam_settings_free WHERE username = '${username}'`;
// 								connection.query(queryFreeSettings, function(error, resultFreeSettings) {
// 									if (error) throw error;
// 									if (resultFreeSettings) {
// 										const game1Free = resultFreeSettings[0].game1;
// 										const game2Free = resultFreeSettings[0].game2;
// 										const gameTitleFree = resultFreeSettings[0].title;
// 										const checkboxFree = resultFreeSettings[0].afk_message_status;
// 										const afkMessageFree = resultFreeSettings[0].afk_message;

// 										const game1Premium = "";
// 										const game2Premium = "";
// 										const gameTitlePremium = "";
// 										const checkboxPremium = "";
// 										const afkMessagePremium = "";

// 										callback({
// 											steamUsernameFree,
// 											steamPasswordFree,
// 											statusFree,
// 											steamUsernamePremium: "None",
// 											steamPasswordPremium: "None",
// 											statusPremium: "Inactive",
// 											game1Free,
// 											game2Free,
// 											gameTitleFree,
// 											checkboxFree,
// 											afkMessageFree,
// 											game1Premium,
// 											game2Premium,
// 											gameTitlePremium,
// 											checkboxPremium,
// 											afkMessagePremium
// 										});
// 									}
// 								});

// 								//
// 								//
// 								//
// 							} else if (resultFree.length <= 0 && resultPremium.length > 0) {
// 								const steamUsernamePremium = resultPremium[0].steamUsernamePremium;
// 								const steamPasswordPremium = resultPremium[0].steamPasswordPremium;
// 								const statusPremium = resultPremium[0].statusPremium;
// 								//
// 								//
// 								//
// 								//add a query for premium steam settings
// 								queryPremiumSettings = `SELECT * FROM steam_settings_free WHERE username = '${username}'`;
// 								connection.query(queryPremiumSettings, function(error, resultPremiumSettings) {
// 									if (error) throw error;
// 									if (resultFreeSettings) {
// 										const game1Free = "";
// 										const game2Free = "";
// 										const gameTitleFree = "";
// 										const checkboxFree = "";
// 										const afkMessageFree = "";


// 										const game1Premium = resultPremiumSettings[0].game1;
// 										const game2Premium = resultPremiumSettings[0].game2;
// 										const gameTitlePremium = resultPremiumSettings[0].title;
// 										const checkboxPremium = resultPremiumSettings[0].afk_message_status;
// 										const afkMessagePremium = resultPremiumSettings[0].afk_message;

// 										callback({
// 											steamUsernameFree: "None",
// 											steamPasswordFree: "None",
// 											statusFree: "Inactive",
// 											steamUsernamePremium,
// 											steamPasswordPremium,
// 											statusPremium,
// 											game1Free,
// 											game2Free,
// 											gameTitleFree,
// 											checkboxFree,
// 											afkMessageFree,
// 											game1Premium,
// 											game2Premium,
// 											gameTitlePremium,
// 											checkboxPremium,
// 											afkMessagePremium
// 										});
// 									}
// 								});
// 								//
// 								//
// 								//
// 							} else {
// 								const game1Free = "";
// 								const game2Free = "";
// 								const gameTitleFree = "";
// 								const checkboxFree = "";
// 								const afkMessageFree = "";

// 								const game1Premium = "";
// 								const game2Premium = "";
// 								const gameTitlePremium = "";
// 								const checkboxPremium = "";
// 								const afkMessagePremium = "";

// 								callback({
// 									steamUsernameFree: "None",
// 									steamPasswordFree: "None",
// 									statusFree: "Inactive",
// 									steamUsernamePremium: "None",
// 									steamPasswordPremium: "None",
// 									statusPremium: "Inactive",
// 									game1Free,
// 									game2Free,
// 									gameTitleFree,
// 									checkboxFree,
// 									afkMessageFree,
// 									game1Premium,
// 									game2Premium,
// 									gameTitlePremium,
// 									checkboxPremium,
// 									afkMessagePremium
// 								});
// 							}
// 						});
// 					});




// 				} else {
// 					// Otherwise, only query the free table
// 					query = `SELECT * FROM steamaccounts_free WHERE username = '${username}'`;
// 					connection.query(query, function(error, result) {
// 						if (error) throw error;

// 						// Check if there is a result from the database
// 						if (result.length > 0) {
// 							// Get the variables from the database result
// 							const steamUsernameFree = result[0].steamUsernameFree;
// 							const steamPasswordFree = result[0].steamPasswordFree;
// 							const statusFree = result[0].statusFree;
// 							queryFreeSettings = `SELECT * FROM steam_settings_free WHERE username = '${username}'`;
// 							connection.query(queryFreeSettings, function(error, resultFreeSettings) {
// 								if (error) throw error;
// 								if (resultFreeSettings) {
// 									const game1Free = resultFreeSettings[0].game1;
// 									const game2Free = resultFreeSettings[0].game2;
// 									const gameTitleFree = resultFreeSettings[0].title;
// 									const checkboxFree = resultFreeSettings[0].afk_message_status;
// 									const afkMessageFree = resultFreeSettings[0].afk_message;

// 									const game1Premium = "";
// 									const game2Premium = "";
// 									const gameTitlePremium = "";
// 									const checkboxPremium = "";
// 									const afkMessagePremium = "";

// 									callback({
// 										steamUsernameFree,
// 										steamPasswordFree,
// 										statusFree,
// 										steamUsernamePremium: "None",
// 										steamPasswordPremium: "None",
// 										statusPremium: "None",
// 										game1Free,
// 										game2Free,
// 										gameTitleFree,
// 										checkboxFree,
// 										afkMessageFree,
// 										game1Premium,
// 										game2Premium,
// 										gameTitlePremium,
// 										checkboxPremium,
// 										afkMessagePremium
// 									});
// 								} else {
// 									const game1Free = "";
// 									const game2Free = "";
// 									const gameTitleFree = "";
// 									const checkboxFree = "";
// 									const afkMessageFree = "";

// 									const game1Premium = "";
// 									const game2Premium = "";
// 									const gameTitlePremium = "";
// 									const checkboxPremium = "";
// 									const afkMessagePremium = "";

// 									callback({
// 										steamUsernameFree,
// 										steamPasswordFree,
// 										statusFree,
// 										steamUsernamePremium: "None",
// 										steamPasswordPremium: "None",
// 										statusPremium: "None",
// 										game1Free,
// 										game2Free,
// 										gameTitleFree,
// 										checkboxFree,
// 										afkMessageFree,
// 										game1Premium,
// 										game2Premium,
// 										gameTitlePremium,
// 										checkboxPremium,
// 										afkMessagePremium
// 									});


// 								}

// 							});

// 						} else {
// 							const game1Free = "";
// 							const game2Free = "";
// 							const gameTitleFree = "";
// 							const checkboxFree = "";
// 							const afkMessageFree = "";

// 							const game1Premium = "";
// 							const game2Premium = "";
// 							const gameTitlePremium = "";
// 							const checkboxPremium = "";
// 							const afkMessagePremium = "";

// 							callback({
// 								steamUsernameFree: "None",
// 								steamPasswordFree: "None",
// 								statusFree: "Inactive",
// 								steamUsernamePremium: "None",
// 								steamPasswordPremium: "None",
// 								statusPremium: "None",
// 								game1Free,
// 								game2Free,
// 								gameTitleFree,
// 								checkboxFree,
// 								afkMessageFree,
// 								game1Premium,
// 								game2Premium,
// 								gameTitlePremium,
// 								checkboxPremium,
// 								afkMessagePremium
// 							});
// 						}
// 					});

// 				}
// 			}

// 			// Check the user's variables
// 			checkUserVariables(userType, username, function(variables) {
// 				// Return the user type and the variables to the caller
// 				callback({
// 					userType,
// 					steamTimeleftFree,
// 					steamTimeleftPremium,
// 					variables
// 				});
// 			});
// 		}
// 	});
// }


//minified version of // function
function checkUserPlanAndVariables(e,m){const s=`SELECT * FROM accounts WHERE username = '${e}'`;connection.query(s,(function(s,a){if(s)throw s;if(a.length>0){userType=a[0].plan,steamTimeleftFree=a[0].timeleft_free,steamTimeleftPremium=a[0].timeleft_premium,function(e,m,s){let a="";if("Premium"===e){let e=`SELECT * FROM steamaccounts_free WHERE username = '${m}'`;connection.query(e,(function(e,a){if(e)throw e;let r=`SELECT * FROM steamaccounts_premium WHERE username = '${m}'`;connection.query(r,(function(e,r){if(e)throw e;if(a.length>0&&r.length>0){const e=a[0].steamUsernameFree,t=a[0].steamPasswordFree,i=a[0].statusFree,u=r[0].steamUsernamePremium,n=r[0].steamPasswordPremium,g=r[0].statusPremium;queryFreeSettings=`SELECT * FROM steam_settings_free WHERE username = '${m}'`,connection.query(queryFreeSettings,(function(a,r){if(a)throw a;r&&(queryPremiumSettings=`SELECT * FROM steam_settings_premium WHERE username = '${m}'`,connection.query(queryFreeSettings,(function(m,a){if(a){const m=r[0].game1,o=r[0].game2,P=r[0].title,F=r[0].afk_message_status,c=r[0].afk_message,f=a[0].game1,l=a[0].game2,k=a[0].title,T=a[0].afk_message_status,h=a[0].afk_message;s({steamUsernameFree:e,steamPasswordFree:t,statusFree:i,steamUsernamePremium:u,steamPasswordPremium:n,statusPremium:g,game1Free:m,game2Free:o,gameTitleFree:P,checkboxFree:F,afkMessageFree:c,game1Premium:f,game2Premium:l,gameTitlePremium:k,checkboxPremium:T,afkMessagePremium:h})}else{s({steamUsernameFree:e,steamPasswordFree:t,statusFree:i,steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"Inactive",game1Free:"",game2Free:"",gameTitleFree:"",checkboxFree:"",afkMessageFree:"",game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}})))})),s({steamUsernameFree:e,steamPasswordFree:t,statusFree:i,steamUsernamePremium:u,steamPasswordPremium:n,statusPremium:g,game1Free:game1Free,game2Free:game2Free,gameTitleFree:gameTitleFree,checkboxFree:checkboxFree,afkMessageFree:afkMessageFree,game1Premium:game1Premium,game2Premium:game2Premium,gameTitlePremium:gameTitlePremium,checkboxPremium:checkboxPremium,afkMessagePremium:afkMessagePremium})}else if(a.length>0&&r.length<=0){const e=a[0].steamUsernameFree,r=a[0].steamPasswordFree,t=a[0].statusFree;queryFreeSettings=`SELECT * FROM steam_settings_free WHERE username = '${m}'`,connection.query(queryFreeSettings,(function(m,a){if(m)throw m;if(a){const m=a[0].game1,i=a[0].game2,u=a[0].title,n=a[0].afk_message_status,g=a[0].afk_message;s({steamUsernameFree:e,steamPasswordFree:r,statusFree:t,steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"Inactive",game1Free:m,game2Free:i,gameTitleFree:u,checkboxFree:n,afkMessageFree:g,game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}}))}else if(a.length<=0&&r.length>0){const e=r[0].steamUsernamePremium,a=r[0].steamPasswordPremium,t=r[0].statusPremium;queryPremiumSettings=`SELECT * FROM steam_settings_free WHERE username = '${m}'`,connection.query(queryPremiumSettings,(function(m,r){if(m)throw m;if(resultFreeSettings){const m="",i="",u="",n="",g="",o=r[0].game1,P=r[0].game2,F=r[0].title,c=r[0].afk_message_status,f=r[0].afk_message;s({steamUsernameFree:"None",steamPasswordFree:"None",statusFree:"Inactive",steamUsernamePremium:e,steamPasswordPremium:a,statusPremium:t,game1Free:m,game2Free:i,gameTitleFree:u,checkboxFree:n,afkMessageFree:g,game1Premium:o,game2Premium:P,gameTitlePremium:F,checkboxPremium:c,afkMessagePremium:f})}}))}else{s({steamUsernameFree:"None",steamPasswordFree:"None",statusFree:"Inactive",steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"Inactive",game1Free:"",game2Free:"",gameTitleFree:"",checkboxFree:"",afkMessageFree:"",game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}}))}))}else a=`SELECT * FROM steamaccounts_free WHERE username = '${m}'`,connection.query(a,(function(e,a){if(e)throw e;if(a.length>0){const e=a[0].steamUsernameFree,r=a[0].steamPasswordFree,t=a[0].statusFree;queryFreeSettings=`SELECT * FROM steam_settings_free WHERE username = '${m}'`,connection.query(queryFreeSettings,(function(m,a){if(m)throw m;if(a){const m=a[0].game1,i=a[0].game2,u=a[0].title,n=a[0].afk_message_status,g=a[0].afk_message;s({steamUsernameFree:e,steamPasswordFree:r,statusFree:t,steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"None",game1Free:m,game2Free:i,gameTitleFree:u,checkboxFree:n,afkMessageFree:g,game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}else{s({steamUsernameFree:e,steamPasswordFree:r,statusFree:t,steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"None",game1Free:"",game2Free:"",gameTitleFree:"",checkboxFree:"",afkMessageFree:"",game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}}))}else{s({steamUsernameFree:"None",steamPasswordFree:"None",statusFree:"Inactive",steamUsernamePremium:"None",steamPasswordPremium:"None",statusPremium:"None",game1Free:"",game2Free:"",gameTitleFree:"",checkboxFree:"",afkMessageFree:"",game1Premium:"",game2Premium:"",gameTitlePremium:"",checkboxPremium:"",afkMessagePremium:""})}}))}(userType,e,(function(e){m({userType:userType,steamTimeleftFree:steamTimeleftFree,steamTimeleftPremium:steamTimeleftPremium,variables:e})}))}}))}

module.exports = checkUserPlanAndVariables;