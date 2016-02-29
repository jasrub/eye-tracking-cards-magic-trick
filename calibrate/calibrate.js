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
             // console.log("right wink");
            }
            if (values[i]=="available.left" && !constant[values[i]]["value"]){
             // console.log("left wink")
            }
          }
        } 
        if (constant["avg.x"]["action"] && constant["avg.x"]["action"]) {
         
          };
        }

        document.body.onkeyup = function(e) {
                if (e.which === 32) {

                  //console.log(constant["avg.x"]["value"], constant["avg.y"]["value"]);
                  var ele = document.createElement("div");
                  ele.setAttribute("class","smallCood");
                  ele.style.left = mapEyes(latestEyeX,latestEyeY)[0] + "px";
                  ele.style.top = mapEyes(latestEyeX,latestEyeY)[1] + "px";
                  ele.innerHTML=latestEyeX+","+latestEyeY;
                  document.body.appendChild(ele);
        }
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


   window.onload = WebSocketTest;