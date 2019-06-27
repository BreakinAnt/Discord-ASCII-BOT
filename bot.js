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
    console.log("----------------HELLO DINGUS-----------------");
});
//


//chat commands starts here
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var asciiUsuario = message.substring(10);
        var asciiId = message.substring(9);
        var cmd = args[0];
        
        args = args.splice(1);
        switch(cmd) {
            // adding an ascii
            case 'asciiadd':
                if (asciiUsuario != "") {
                bot.sendMessage({
                    
                    to: channelID,
                    message: "Adicionando...\n"
                    
                });
                sqlInsert(asciiUsuario, user, channelID);
                
                //if the user doesnt put a parameter
                } else {
                    bot.sendMessage({
                    
                        to: channelID,
                        message: "cadê o ascii seu animal de 7 tetas"
                    
                        });
                }

            break;

            //retrieving an ascii from our database
            case 'asciiget':
               
                var id = asciiId;
                
                //if our parameter is not empty, we'll search for the id desired; else we'll start a random select from our database
                if (id != "") {
                //we'll be searching for our selected ascii by his primary key, in this case his ID    
                con.query("SELECT * FROM pOwQ5cpo4x.tb_ascii WHERE "+id+" = id_ascii", function (err, result) {
                        //if our variable result has a [object Object] it means we found our ascii; else we just return a chat message that we found nothing
                        if (result == "[object Object]"){     
                                            
                            var id = result[0].id_ascii; 
                            var arte = result[0].arte_ascii; 
                            var nome = result[0].nome_ascii; 
                            var data = result[0].data_ascii;
                            var mensagem = "ID: " + id + "\n" + arte;
                            
                        } else {
                            bot.sendMessage({
                    
                                to: channelID,
                                message: "Nenhuma ASCII encontrada"
                                
                            });
                            //throw err; got no idea what this fuck does
                        }
                        
                        //sends our ascii as chat message
                        bot.sendMessage({
                    
                            to: channelID,
                            message: mensagem
                            
                        });
                        
                        
                        }); 
                        
                        } else {
                            //we'll select every colunm on our table, put in an array and randomly select one by using Math.random
                            con.query("SELECT * FROM pOwQ5cpo4x.tb_ascii", function (err, result, fields) {
                                if (err) throw err;
                                var idRandom = Math.random()* result.length;
                                idRandom = parseInt(idRandom, 10);
                                
                                bot.sendMessage({
                    
                                    to: channelID,
                                    message: "ID: " + result[idRandom].id_ascii + "\n" + result[idRandom].arte_ascii
                                    
                                });
                                
                                
                            });
                        }
                                                              
            break;
        } 
                         
     }

     
}); 
//chat commands ends here

//connecting with our mysql server
var con = mysql.createConnection({
  host: "host name goes here",
  user: "user name goes here",
  password: "password goes here",
 });

con.connect(function(err) {
  if (err) throw err;
  console.log("***Banco de dados conectado com sucesso***");
  
});
//mysql connecting ends here

//query insert
function sqlInsert(arte, nome, channelID){
    
    con.query("SELECT arte_ascii, id_ascii FROM pOwQ5cpo4x.tb_ascii WHERE BINARY '"+arte+"' = BINARY arte_ascii", function (err, result) {
        
        
        var comparacaoArte;
        
        //check to see if theres anything in result[0].arte_ascii
        //if there is, it'll put the result on comparacaoArte
        //if there's nothing, it'll put a null message
        //its important to put something on the variable comparacaoArte, since if we send just the result[0].arte_ascii without checking we could get a TypeError (Cannot read property 'arte_ascii' of undefined) when we compare it with another variable
        if (result != ""){
        comparacaoArte = result[0].arte_ascii;
        
        } else {
            comparacaoArte = "null";
        }
        
        //we'll check to see if arte is equal to comparacaoArte, if it is, we'll send a chat message informing the user; else we send a chat message saying that it was a sucess and we start the insert function
        if (arte == comparacaoArte)  {
            bot.sendMessage({
                    
                to: channelID,
                message: "ASCII ART já existe pelo ID: " + result[0].id_ascii
                
            });
            
        } else {  
            asciiInsert(arte, nome); 
            //returns the ascii's ID that we just added to our database            
            con.query("SELECT id_ascii FROM pOwQ5cpo4x.tb_ascii WHERE BINARY '"+arte+"' = BINARY arte_ascii", function (err, result, fields) {
                
                if (err) throw err;
                var id = result[0].id_ascii;
                bot.sendMessage({
                    
                    to: channelID,                
                    message: "Usuário " + nome + " adicionou:\n" + arte + "\nID: " + id
                    
                });
                
              });             
 
        }
                  
     });
     
    //we'll use this function to add our ascii art to our database,
    function asciiInsert(arte, nome){ 
    var sql = "INSERT INTO pOwQ5cpo4x.tb_ascii (arte_ascii, nome_ascii, data_ascii) VALUES ( '"+arte+"', '"+nome+"', CURDATE())";
    con.query(sql, function (err, result) {
        if (err) throw err;        
      }); 
    }
}
//query insert ends here

