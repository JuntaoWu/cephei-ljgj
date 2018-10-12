var counterPlus = function(a ,b)
{
    return a+b;
}

var counterCheng = function(a ,b)
{
    return a*b;
}
var Pi = 3.1415926;

var counterCircle = function(r)
{
    return 2*Pi*r;
}

module.exports =
{
    plus:counterPlus,
    cheng:counterCheng,
    circle:counterCircle,
    pi:Pi
}



