
/* global Deck */

var prefix = Deck.prefix

var transform = prefix('transform')

var translate = Deck.translate

var $container = document.getElementById('container')
var $topbar = document.getElementById('topbar')

var $sort = document.createElement('button')
var $shuffle = document.createElement('button')
var $explode = document.createElement('button')
var $flip = document.createElement('button')

$shuffle.textContent = 'Shuffle'
$sort.textContent = 'Sort'
$explode.textContent = 'Magic!'
$flip.textContent = 'Flip'

$topbar.appendChild($flip)
$topbar.appendChild($shuffle)
$topbar.appendChild($sort)
$topbar.appendChild($explode)


var deck = Deck();

var cardCounts = [0,0,0,0,0];

setInterval(function(){ 
  doMagicInterval();
}, 500);

deck.cards.forEach(function (card, i) {
  card.enableDragging();
  card.enableFlipping();
});

$shuffle.addEventListener('click', function () {
  deck.shuffle()
  deck.shuffle()
})
$sort.addEventListener('click', function () {
  deck.sort()
})

$explode.addEventListener('click', function () {
  deck.cards.forEach(function (card, i) {
        card.setSide('back');
  });
  deck.shuffle();
  
  deck.pokerMagic()
  cardCounts = [0,0,0,0,0];
  //play sound
  var sound = document.getElementById("timerSound");
  sound.play();
  //set timeout for 10 seconds to "domagic()"
  setTimeout(function(){ doMagic(); }, 8200);
})

$flip.addEventListener('click', function () {
  deck.flip()
})

deck.mount($container)

deck.intro()
deck.sort()

function changeColor(newColor, x, y)
{
 elem = document.elementFromPoint(x,y);
 if (elem!=document.body){
  console.log(elem);
  console.log(elem.parentElement);
  elem.style.background = newColor;
}
}


// EyeTracking Code
Array.prototype.allValuesSame = function() {
  var threshold = 10;
  var retVal = {"value":this[0]}
  for(var j = 1; j < this.length; j++)
  {
    if (typeof this[0] === 'boolean'){
      if(this[j] != this[0]){
            //console.log(this[j], this[0])
            retVal ["action"] = false
            return retVal
          }
        }
        else {
         if(Math.abs(this[j] - this[0])>threshold) {
          retVal["action"] = false
          return retVal
        }
      }
    }

    retVal["action"]=true
    return retVal
  }

  var ws;

  var values = ["avg.x", "avg.y", "available.right", "available.left", "available.both"]

  var numReadings = 10;

  var readings = {};     // the readings from the analog input
  var readIndex = 0;              // the index of the current reading
  var total = {};                  // the running total
  var average = {};                // the average
  var constant = {};
  var latestEyeX = 0;
  var latestEyeY = 0;

  for (var i=0; i<values.length; i++)  {
    readings[values[i]] = [];
  }

  for (var i=0; i<values.length; i++)  {
    for (var thisReading = 0; thisReading < numReadings; thisReading++){
      readings[values[i]].push (0);
    }
    total[values[i]] = 0;
    average[values[i]] = 0;
  }

  document.body.addEventListener("keyup", function(e) {
    if (e.which === 32) {
      e.preventDefault();
      doMagic();
    }

    if (e.which === 13) {
      if (document.getElementById("eyesPointer").style.display == "block") {
        document.getElementById("eyesPointer").style.display = "none";  
      } else {
        document.getElementById("eyesPointer").style.display = "block";  
      }          
    }
  });


  var mappedCoord = [0,0];

  function WebSocketTest() {
    if ("WebSocket" in window) {
     console.log("WebSocket is supported by your Browser!");

       // Let us open a web socket
       ws = new WebSocket("wss:localhost:5619/");

       ws.onopen = function() {
          // Web Socket is connected, send data using send()
          //ws.send("Message to send");
        };

        ws.onmessage = function (evt) {
          var data = JSON.parse(evt.data)
          var tempData = {}
          tempData["avg.x"] = data.avg.x;
          tempData["avg.y"] = data.avg.y;
          tempData["available.right"] = data.available.right;
          tempData["available.left"] = data.available.left;
          tempData["available.both"] = data.available.both;
          latestEyeX = data.avg.x;
          latestEyeY = data.avg.y;

          for (var i=0; i<values.length; i++) {
          // subtract the last reading:

          total[values[i]] = total[values[i]] - readings[values[i]][readIndex];
          // read from the sensor:
          readings[values[i]][readIndex] = tempData[values[i]]
          // add the reading to the total:
          total[values[i]] = total[values[i]] + readings[values[i]][readIndex];

          // calculate the average:
          average[values[i]] = total[values[i]] / numReadings;
          constant[values[i]] = readings[values[i]].allValuesSame();

          if (constant[values[i]]["action"]){
            if ((values[i]=="available.right") && !constant[values[i]]["value"]) {
              //changeBackground('blue');
            }
            if (values[i]=="available.left" && !constant[values[i]]["value"]){
              //changeBackground('green');
            }
          }
        }
       // if (constant["avg.x"]["action"] && constant["avg.x"]["action"]) {
         mappedCoord = mapEyes(average["avg.x"], average["avg.y"]);

        //}

        document.getElementById("eyesPointer").style.left = mappedCoord[0]+"px";
        document.getElementById("eyesPointer").style.top = mappedCoord[1]+"px";

        // advance to the next position in the array:
        readIndex = readIndex + 1;

        // if we're at the end of the array...
        if (readIndex >= numReadings) {
            // ...wrap around to the beginning:
            readIndex = 0;
          }
        };

        ws.onclose = function() {
          // websocket is closed.
          alert("Connection is closed...");
        };
      } else {
       // The browser doesn't support WebSocket
       alert("WebSocket NOT supported by your Browser!");
     }
   }

   function changeBackground(color) {
     document.body.style.background = color;
   }

   window.onload = WebSocketTest;

// assuming full screen
var screenTopLeft = [0,0];
var screenBottomRight = [window.screen.width, window.screen.height];
console.log(screenBottomRight)
//detected points:
var detecTopLeft = [-70, 0];
var detecBottomRight = [2500, 1400];

function mapPoint(x,y) {
  tx = ((detecBottomRight[0]-detecTopLeft[0])/( screenBottomRight[0] - screenTopLeft[0]))*x;
  ty = ((detecBottomRight[1]-detecTopLeft[1])/( screenBottomRight[1] - screenTopLeft[1]))*y;
  return [tx,ty];
}

function doMagicInterval() {
  var ChosedCardIndex = 0;

  var rangeWidth = window.screen.width/5;
  var range = rangeWidth
  while (mappedCoord[0] > range) {
    range+=rangeWidth;
    ChosedCardIndex++
  }  
  cardCounts[ChosedCardIndex]++
//  console.log(ChosedCardIndex);
}

function doMagic (){

  var maximum = Math.max.apply( Math, cardCounts );
  var ChosedCardIndex = cardCounts.indexOf(maximum);

  var chosenCard = deck.pokerCards[ChosedCardIndex];
  console.log(chosenCard)

  deck.shuffle()
  deck.shuffle()

  setTimeout(function() {  
     deck.cards.forEach(function (card, i) {
        card.setSide('back');
    })

    deck.cards.forEach(function (card, i) {
      if (card.i==(chosenCard)) {
        card.setSide('front');
      }
    })
  },150);
              // console.log("here");

              deck.cards.forEach(function (card, i) {

                card.animateTo({
                     delay: 1000 + i * 2, // wait 1 second + i * 2 ms
                     duration: 500,
                     ease: 'quartOut',
                     
                     x: ((i%13)*((window.innerWidth)/14))-(window.innerWidth/2.3),
                     y: i%4*window.innerHeight/5- window.innerHeight/3
                   })
              });


            }

            function mapEyes(x,y) {
              width = window.screen.width;
              height = window.screen.height;
              screenTopX = 0;
              screenTopY = 0;

  //0,0
  tlX = 47.5;
  tlY = 35.1;

  //screenWidth,0
  trX = 2623.0;
  trY = -105.6;
  
  //0,screenHeight
  blX = -119.2;
  blY = 1340.0;
  
  //screenWidth, screenHeight
  brX = 2503.8;
  brY = 1423.8;

  //screenTopXProportion*width
  x1 = ((x-tlX)/(trX-tlX))*width+screenTopX;
  y1 = screenTopY;
  //screenBotXProportion*width
  x2 = ((x-blX)/(brX-blX))*width+screenTopX;
  y2 = screenTopY+height;

  //screenLeftYProportion 
  x3 = screenTopX;
  y3 = (y-tlY)/(blY-tlY)*height+screenTopY;
  //screenRightYProportion
  x4 = screenTopX+width;
  y4 = (y-trY)/(brY-trY)*height+screenTopY;


  resultX = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
  resultY = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));

  return [resultX,resultY];

}