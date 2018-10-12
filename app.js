
var httpc = require('http');

var server = httpc.createServer(function(request,rewspone)
{
    console.log("request received ");
    rewspone.writeHead(200,{"Content-Type":"pdf/plain"}
    );
    rewspone.write("wo ganni ma !");
    rewspone.end();
});
server.listen(3000,'127.0.0.1');
console.log("server started on localhost port 3000 !");
/*

//事件
var events = require('events');
var util = require('util');

var myEmitter = new events.EventEmitter();

var Persion  = function(name)
{
    this.name = name;
}

util.inherits(Persion,events.EventEmitter);

var cw = new Persion("Luooyong");
var wt = new Persion("wujuntao");
var st = new Persion("stentao");

var persionArr = [cw,wt,st];

persionArr.forEach(function(p)
{
    p.on("talk",function(msg){
        console.log(p.name +" talk :" + msg);
    });

});

cw.emit("talk"," wocao is wo buxiang ganle !\n");
wt.emit("talk","  lailailai laozi buxiangxin  is wo buxiang ganle ! \n");
*/

/*
myEmitter.on("onEvent",function(msg)
{

   console.log(" current leveal msg is " + msg); 
});

myEmitter.emit("onEvent"," 美元 name is luoyong 52 cwalk !");
*/




/*
console.log(__filename);
console.log(__dirname);

console.log("hello world");
var time = 0;
setInterval(function() {
    console.log("3 sencond have passed!" + time++);
}
, 2000);
*/

/* 
// 模块
var counter = require('./count');

console.log("current plus is " + counter.plus(1,40 ) +" cheng is "+ counter.cheng(20,12)+ " circle is " + counter.circle(31)+" pi is " + counter.pi );
function callbackTest(fun,name)
{
     name = name+"  ss 1024 !";
    fun(name);
}

var tst = function()
{

    console.log("test call back fountion !");
}

callbackTest(function(na)
{

    console.log("test call back fountion !" + na);
});

*/
