var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var mysql = require('mysql');

//-- Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
//

//--- Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    console.log("***Bot has logged in***");
});
//


//receiving message
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!' && userID != bot.id) {
        var args = message.substring(1).split(' ');
        var params = args[1];
        var asciiUser = message.substring(10);
        var cmd = args[0];

        switch(cmd) {
            // adding an ascii
            case 'asciiadd':
                asciiAdd(user, channelID, charReplace(asciiUser));
            break;

            //retrieving an ascii from our database
            case 'asciiget':  
                console.log(params);                             
                asciiGet(channelID, params);                                                              
            break;

            //showing commands
            case 'asciihelp':
                asciiHelp(channelID);
            break;
        }                          
     }     
}); 
//

//connecting with our mysql server
var con = mysql.createConnection({
  host: 'host',
  user: 'user',
  password: 'password',
 });

con.connect(function(err) {
  if (err) throw err;
  console.log("***Database has logged in***");  
});
//

//chat commands
function asciiAdd(user, channelID, params){
    if (params != null) {
        bot.sendMessage({
            
            to: channelID,
            message: "Adding...\n"
            
        });
    sqlInsert(params, user, channelID);               
    //if the user doesnt put a parameter
        } else {
            bot.sendMessage({
            
                to: channelID,
                message: "No ASCII found."
            
            });
        }
}

function asciiGet(channelID, params){
    //if our parameter is not null, we'll search for the id desired; else we'll start a random select from our database
    if (params != null) {
        //we'll be searching for our selected ascii by his primary key, in this case his ID    
        asciiSelect(params, channelID);
            } else {
            //we'll select every colunm on our table, put in an array and randomly select one by using Math.random                        
            asciiSelectRandom(channelID);
            }
}

function asciiHelp(channelID){
    bot.sendMessage({
            
        to: channelID,
        message: "Commands:\n" + "!asciiadd [ASCII HERE]\n" + "!asciiget [ASCII'S ID HERE] (leave it empty to pick a random one)\n"
    
    });    
}
//

//insert ascii
function sqlInsert(art, name, channelID){    
    con.query("SELECT arte_ascii, id_ascii FROM pOwQ5cpo4x.tb_ascii WHERE BINARY '"+art+"' = BINARY arte_ascii", function (err, result) {                              
        /*
        check to see if theres anything in result[0].arte_ascii, if there is, it'll put the result on comparationArt, if there's nothing, it'll put a null message. 
        its important to put something on the variable comparationoArt, since if we send just the result[0].arte_ascii without checking we could get a TypeError (Cannot read property 'arte_ascii' of undefined) when we compare it with another variable
        */   
        var comparationArt;   
          
        if (result != ""){
            comparationArt = result[0].arte_ascii;
                       
            } else {
                comparationArt = null;
            }        
        //we'll check to see if art is equal to comparationArt, if it is, we'll send a chat message informing the user; else we'll start the insert function and get our new ascii's id
        if (charReplace(art) == comparationArt) {
            console.log(" "+comparationArt + "  " + art);
            bot.sendMessage({
                    
                to: channelID,
                message: "ASCII already exists by ID: " + result[0].id_ascii
                
            });            
            } else {  
                
                asciiInsert(art, name); 
                //returns the ascii's ID that we just added to our database            
                con.query("SELECT id_ascii FROM pOwQ5cpo4x.tb_ascii WHERE BINARY '"+art+"' = BINARY arte_ascii", function (err, result) {                
                    if (err) throw err;
                    var id = result[0].id_ascii;
                    
                    bot.sendMessage({
                        
                        to: channelID,                
                        message: "User " + name + " has added:\n" + charOriginal(art) + "\nID: " + id
                        
                    });                
                });              
            }                  
    });     
    //we'll use this function to add our ascii art to our database,
    function asciiInsert(art, name){
 
    var sql = "INSERT INTO pOwQ5cpo4x.tb_ascii (arte_ascii, nome_ascii, data_ascii) VALUES ( '"+art+"', '"+name+"', CURDATE())";
    con.query(sql, function (err) {
        if (err) throw err;        
      }); 
    }
}
//

//select specific id
function asciiSelect(id, channelID){
    con.query("SELECT * FROM pOwQ5cpo4x.tb_ascii WHERE "+id+" = id_ascii", function (err, result) {
        //if our variable result has a [object Object] it means we found our ascii; else we just return a chat message that we found nothing                
        if (result == "[object Object]"){
                
            bot.sendMessage({
                    
                to: channelID,
                message: "ID: " + result[0].id_ascii + "\n" + charOriginal(result[0].arte_ascii)                
                
            });                                 
            } else {            
                bot.sendMessage({
                        
                    to: channelID,
                    message: "No ASCII found."
                    
                });
            }        
        });
}

//select and picking a random one from the list
function asciiSelectRandom (channelID){
    con.query("SELECT * FROM pOwQ5cpo4x.tb_ascii", function (err, result) {
        if (err) throw err;
        var idRandom = Math.random()* result.length;
        idRandom = parseInt(idRandom, 10);
        
        bot.sendMessage({

            to: channelID,
            message: "ID: " + result[idRandom].id_ascii + "\n" + charOriginal(result[idRandom].arte_ascii)
            
        });                                                                
    });
}
//

//these functions will be used to change certain problematic characters on our ascii that would otherwise mess with our script, like ' " or ;. also helps protecting against sql injections
function charReplace (ascii){  
    return ascii.replace(/'/g, "¹").replace(/"/g, "²").replace(/;/g, "³");     
}

function charOriginal (ascii){
    return ascii.replace(/¹/g, "'").replace(/²/g, '"').replace(/³/g, ";"); 
}
