var express = require('express');

var bodyParser = require('body-parser');

var fs = require('fs');

var app = express();

var multer = require('multer');

var createfolder = function(folder)
{
    try{
        fs.accessSync(folder);
    }
    catch(e)
    {
        fs.mkdirSync(folder);
    }
}

var uploadfolder = "./upload/"

createfolder(uploadfolder);

var storage= multer.diskStorage({
    destination:function(req,file,cb)
    {
        cb(null,uploadfolder);
    },
    filename:function(req,file,cb)
    {
        cb(null,file.originalname);
    }
});


var upload = multer({storage:storage});
//creat json parser
var jsonParser =  bodyParser.json();

//creat application /x-www-form-urlencoded parser
var urlencodeeParser =  bodyParser.urlencoded({extended:false})

app.get('/',function(req,res){
   console.dir(req.query);
   res.send( "c home patge is here @ " + req.query.find);

});

app.post("/", urlencodeeParser, function(req,res){
    console.dir(req.body);
     res.send( "name is :"  +req.body.name +" age is  " + req.body.age+" sex is  "+ req.body.sex);
}
);

app.post("/upload",upload.single('logo'), function(req,res){
    console.dir(req.file);
     res.send( {'ret_code':0});
}
);

/*
app.post("/upload",jsonParser, function(req,res){
    console.dir(req.body);
     res.send( "name is :"  +req.body.name +" age is  " + req.body.age+" sex is  "+ req.body.sex);
}
);
*/


app.listen(3000);
console.log("listening to port 3000 !");

/*
 app.get('/profile/:id',function(req,res){
     var responseObj = {
         name:"52cwalk111"
     }
     var js = JSON.stringify(responseObj);
    res.send(js + req.params.id);

 });

 app.get('/ab?cd',function(res,rep){
    res.send('/ab7cd');
 });

 app.listen(3000);
 console.log("listening to port 3000 !");
 */
