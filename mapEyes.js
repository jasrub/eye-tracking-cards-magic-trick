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