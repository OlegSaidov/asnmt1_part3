//copyright-2018 Oleg Saidov, Website Engineering, prof. Alfred Rezk
//This app, lets direct access to index.html and index.js, beware.


//import modules, querystring, fs, path, and http
var http = require('http');
var fs = require('fs');
var path = require('path');
var {parse} = require('querystring');

var server = http.createServer((req, res) => {
    
    var formPath = path.join(process.cwd(), req.url);
    var formMethod = req.method;
    var formBase = path.basename(formPath);
   
    console.log(formMethod);
   
          if(formMethod =='POST'){

                processForm();

                }else{               
                
                sendPage();    
                    
            };//method check                 
             



function processForm() {

    var formBody = "";
    req.on("data", (chunk) => {
        formBody+=chunk.toString();
         }); 

    req.on("end", () => {
        //get data from the form
        var email = parse(formBody).email;
        var password = parse(formBody).password;
        
        // read file password.txt
        fs.readFile("password.txt", "utf8", (err, data) => {
            if (err) throw error;
        var data = JSON.parse(data);
        var emailOnFile = data.email;
        var passwordOnFile = data.password;
       
        // check if there is a match
        email = email.toLowerCase();
        if(email === emailOnFile){
              if(password === passwordOnFile){
                  console.log(`Access Granted!  User email: ${email}, User password: ${password} `);
                  res.writeHead(301, {'Location':'./index.html'});
                  res.end();
                  
              }else{
                  console.log(`Access Denied! Password mismatch. User email: ${email} User password: ${password}`);
                  res.writeHead(200, {'Content-Type':'text/html'});
                  res.write('<h1>Access Denied! Wrong Password.</h1>')
              }

        } else {
            console.log(`Access Denied! E-mail mismatch. User email: ${email}`);
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write('<h1>Access Denied! Wrong e-mail and password.</h1>')
        }
      


        });

   
    });

}

function sendPage() {

    if(fs.existsSync(formPath)){
        console.log(formPath); 
        fs.stat(formPath, (err, stats) => {
                if(err) {throw error;}
                else if(stats.isFile()){       
                                                
                                        fs.readFile(formPath, (err, data) =>{
                                            if(err) throw error;
                                            res.writeHead(200,{'Content-Type': 'text/html'});
                                            var fileStream = fs.createReadStream(formPath);
                                            fileStream.pipe(res);
                                        
                                        });//readFile                  
                    
                }else if(stats.isDirectory()){
                    console.log(`${formPath}  is a path to a directory not a file!`);
                    res.writeHead(404, {"Content-Type":"text/html"});
                    res.write("<h1>What you're requesting is a directory. Page not found, error 404.</h1><sub>Hint: Try <i>userlogin.html</i></sub>");
                    res.end();
                    
                }else{
                    console.log(`${formPath}  caused internal server error!`);
                    res.writeHead(500, {"Content-Type":"text/html"});
                    res.write("<h1>You're breaking my server! Error 500</h1>");
                    res.end();

                } ;

        });//fs.stat 

    }else{
    console.log(`${formPath} doesn't exists!`);
    res.writeHead(404, {"Content-Type":"text/html"});
    res.write("<h1>Page not found, error 404</h1>");
    res.end();
    

    };//exitsSync
}

   
}); //createServer
server.listen(7000);