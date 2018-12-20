// Init every global variables (values set in window.onload function)
var DEBUG = false;
var widthBackground;
var heightBackground;
var imgBackground = new Image();
var allCars = Array();
var nbCollide =0;
var collidePoint = Array();
var carTrace =0;
var carTracePoint = Array();
var widthCar;
var heightCar;
var pos1stCar;
var lengthRoad;
var spaceBetweenCar;
var sizeAreaWhereCarTurn;
var delayBetween2display;
var canvas;
var context;
var windowsTimer;
var mapingLanePosX = Array();
var mapingLanePosY = Array();
var nbCarEachLane = Array();
var Zone = Array() ;

 // Define the position of road
 var centerNordCarX ;
 var centerSudCarX ;
 var centerWestCarX ;
 var centerEastCarX ;

 var centerNordCarY ;
 var centerSudCarY ;
 var centerWestCarY ;// center of the right road
 var centerEastCarY;// center of the right road

var typeConfig=0;

// Usefull to manage rotation
var TO_RADIANS = Math.PI / 180;

class CollidePoint{
    constructor(posX, posY, color){
        this.posX = posX;
        this.posY = posY;
        this.color = color;
    }

    display(context, color){
        context.beginPath();
        context.rect(this.posX-2, this.posY-2, 4, 4);
        context.strokeStyle = color;
        context.stroke();
    }
}

class Car {
    constructor(lane, laneTurn, speed_zone1, speed_zone2, speed_inter, posInLine, color) {
        // Set attibutes of the new object car : 
        this.lane = lane;
        this.laneTurn = laneTurn;
        this.posInLine = posInLine;
        this.img = new Image();
        this.img.src = "image/car" + color + ".png";

        this.centerX;
        this.centerY;

        // speed = px/s
        this.speed_zone1 = speed_zone1 * delayBetween2display / 1000;
        this.speed_zone2 = speed_zone2 * delayBetween2display / 1000;
        this.speed_inter = speed_inter * delayBetween2display / 1000;

        // Set the position of the car depending to its lane, the number of car in this lane and the attribute posInLine defined
        this.posX = mapingLanePosX[lane];
        this.posY = mapingLanePosY[lane];
        if (lane == "North-right") {
            if (posInLine == "auto")
                this.posY -= (heightCar + spaceBetweenCar) * nbCarEachLane[lane]++;
            else
                this.posY = parseInt(posInLine);

            this.angle = 90;
        } else if (lane == "South-right") {
            if (posInLine == "auto")
                this.posY += (heightCar + spaceBetweenCar) * nbCarEachLane[lane]++;
            else
                this.posY = parseInt(posInLine);

            this.angle = 270;
        } else if (lane == "West-right") {
            if (posInLine == "auto")
                this.posX -= (widthCar + spaceBetweenCar) * nbCarEachLane[lane]++;
            else
                this.posX = parseInt(posInLine);

            this.angle = 0;
        } else if (lane == "East-right") {
            if (posInLine == "auto")
                this.posX += (widthCar + spaceBetweenCar) * nbCarEachLane[lane]++;
            else
                this.posX = parseInt(posInLine);

            this.angle = 180;
        }
    }

    // Draw the car on the canvas depending to its attribute value
    display(context) {
        //We will save the current state of the canvas , then we will draw the car with the good angle and good center , and then restore how was the canvas
        //because the canvas will be affected by the changes on the car drawing , so with this , we can dodge corrupting the canvas
        context.save();
        context.translate(this.posX + widthCar / 2, this.posY + heightCar / 2);
        context.rotate(this.angle * TO_RADIANS);
        context.translate(-(this.posX + widthCar / 2), -(this.posY + heightCar / 2));
        context.drawImage(this.img, this.posX, this.posY);

        context.restore();
    }

    // Move the car : update the values of its attributes
    move() {
        var speed;

        // Default speed
        speed = this.speed_zone1;
        //console.log(this.posX + widthCar);
       

        if ((this.posY + heightCar >= Zone[0].internalZone['North-right'] && this.posY + heightCar <= Zone[0].internalZone['South-right']) 
                && (this.posX + widthCar >= Zone[0].internalZone['West-right'] && this.posX + widthCar <= Zone[0].internalZone['East-right'])) {
            speed = this.speed_inter;
        } 
        if ((this.posY + heightCar >= Zone[0].criticalZone['North-right'] && this.posY + heightCar <= Zone[0].criticalZone['South-right']) 
                && (this.posX + widthCar >= Zone[0].criticalZone['West-right'] && this.posX + widthCar <= Zone[0].criticalZone['East-right'])) {
                speed = this.speed_zone2;
    
            //here we check if we are in zone intersection
        } 
        //We will check the lane where the car is situated , and which zone he is currently in , and then adapt the speed depending on these 2 factors
        switch (this.lane) {
            case "North-right":
               
                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "East-left") {
                    var posStartTurning = Zone[0].criticalZone['North-right'] - widthCar;
                    var distInInter = this.posY - posStartTurning;
                    if (distInInter > 0)
                        this.angle = 90 + (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "West-left") {
                    var posStartTurning = Zone[0].criticalZone['North-right'];
                    var distInInter = this.posY - posStartTurning;
                    if (distInInter > 0)
                        this.angle = 90 - (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "South-right":
              

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "East-left") {
                    var posStartTurning = Zone[0].criticalZone['South-right'];
                    var distInInter = posStartTurning - this.posY;
                    if (distInInter > 0)
                        this.angle = 270 + (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "West-left") {
                    var posStartTurning = Zone[0].criticalZone['South-right'] - widthCar;
                    var distInInter = posStartTurning - this.posY;
                    if (distInInter > 0)
                        this.angle = 270 - (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "East-right":
              
                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "South-left") {
                    var posStartTurning = Zone[0].criticalZone['East-right'] - widthCar;
                    var distInInter = posStartTurning - this.posX;
                    if (distInInter > 0)
                        this.angle = 180 - (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "North-left") {
                    var posStartTurning = Zone[0].criticalZone['East-right'];
                    var distInInter = posStartTurning - this.posX;
                    if (distInInter > 0)
                        this.angle = 180 + (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "West-right":
               

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "South-left") {
                    var posStartTurning = Zone[0].criticalZone['West-right'] - widthCar;
                    var distInInter = this.posX - posStartTurning;
                    if (distInInter > 0)
                        this.angle = (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "North-left") {
                    var posStartTurning = Zone[0].criticalZone['West-right'];
                    var distInInter = this.posX - posStartTurning;
                    if (distInInter > 0)
                        this.angle = -(90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            default :
                speed = 30 * delayBetween2display / 1000;
                console.log("ERROR : this.lane >> default")
                break;

               
    }

        
        // The car moves depending to its angle : 
        this.posY += speed * Math.sin(this.angle * TO_RADIANS);
        this.posX += speed * Math.cos(this.angle * TO_RADIANS);

    }

};

window.onload = function ()
{
    

    InitGloabalVars();
    //DisplayAll()

    // The function Update will be called each delayBetween2display ms
    windowsTimer = window.setInterval(Update, delayBetween2display);

    ManageEventButtons();
};

function InitGloabalVars() {

    // Set the default values for every global variable
    widthBackground = 1000;
    heightBackground = 1000;
   
    // Default Configuration
    imgBackground.src = "image/background.png";

   

    // Set the position (X and Y) both Zones 
   //empty my table zone
   Zone = [];
   var internalZone=[];
   var criticalZone=[];

   internalZone['West-right'] = 255;
   internalZone['East-right'] = 775; 
   internalZone['North-right'] = 255;
   internalZone['South-right'] = 775;

   criticalZone['West-right'] = 450;
   criticalZone['East-right'] = 550; 
   criticalZone['North-right'] = 450;
   criticalZone['South-right'] = 550;

   var Zone1 = {internalZone, criticalZone};

   Zone.push(Zone1);

   
   CreateAllCars(1);

   widthCar = 20;
   heightCar = 20;
   // By default the first car of each lane is 300px before the screan
   pos1stCar = -300;

   lengthRoad = 40;
   spaceBetweenCar = 50;
   sizeAreaWhereCarTurn = 50;
   //32ms between 2 display -> 60Fps
   delayBetween2display = 32;

   // Define the position of road
   centerNordCarX = widthBackground / 2 - lengthRoad / 2 + widthCar / 4;
   centerSudCarX = widthBackground / 2 - lengthRoad / 2 + widthCar ;
   centerWestCarX = pos1stCar ;
   centerEastCarX = widthBackground - pos1stCar - widthCar;

   centerNordCarY = pos1stCar;
   centerSudCarY = heightBackground - pos1stCar - heightCar;
   centerWestCarY = heightBackground / 2 + lengthRoad / 2 - heightCar / 2;// center of the right road
   centerEastCarY = heightBackground / 2 - lengthRoad / 2 - heightCar / 2;// center of the right road

   mapingLanePosX["North-right"] = centerNordCarX;// center of the right road
    mapingLanePosX["South-right"] = centerSudCarX;// center of the right road
    mapingLanePosX["West-right"] = centerWestCarX ;
    mapingLanePosX["East-right"] = centerEastCarX ;

    // Set the position Y of the fisrt car of each lane
    mapingLanePosY["North-right"] = centerNordCarY ;
    mapingLanePosY["South-right"] = centerSudCarY ;
    mapingLanePosY["West-right"] = centerWestCarY ;// center of the right road
    mapingLanePosY["East-right"] =centerEastCarY ;// center of the right road

    nbCarEachLane["North-right"] = 0;
    nbCarEachLane["South-right"] = 0;
    nbCarEachLane["West-right"] = 0;
    nbCarEachLane["East-right"] = 0;

    // set configuration
     $( "#validate" ).click(function( event ) {
        var typeConfig = $( "#typeConfig" ).val() ;
        var typeInt = parseInt(typeConfig)
    
        switch(typeInt)
        {
            case 1:
                imgBackground.src = "image/background.png";

                //empty my table zone
                Zone = [];
                var internalZone=[];
                var criticalZone=[];

                internalZone['West-right'] = 255;
                internalZone['East-right'] = 775; 
                internalZone['North-right'] = 255;
                internalZone['South-right'] = 775;

                criticalZone['West-right'] = 450;
                criticalZone['East-right'] = 550; 
                criticalZone['North-right'] = 450;
                criticalZone['South-right'] = 550;

                var Zone1 = {internalZone, criticalZone};

                Zone.push(Zone1);
                CreateAllCars(1); 
                
               // Define the position of road
               centerNordCarX = widthBackground / 2 - lengthRoad / 2 ;
               centerSudCarX = widthBackground / 2 - lengthRoad / 2 + widthCar ;
               centerWestCarX = pos1stCar ;
               centerEastCarX = widthBackground - pos1stCar - widthCar;

                centerNordCarY = pos1stCar;
                centerSudCarY = heightBackground - pos1stCar - heightCar;
                centerWestCarY = heightBackground / 2 + lengthRoad / 2 - heightCar / 2;// center of the right road
                centerEastCarY = heightBackground / 2 - lengthRoad / 2 - heightCar / 2;// center of the right road

                mapingLanePosX["North-right"] = centerNordCarX;// center of the right road
                mapingLanePosX["South-right"] = centerSudCarX;// center of the right road

                mapingLanePosX["West-right"] = centerWestCarX ;
                mapingLanePosX["East-right"] = centerEastCarX ;

                // Set the position Y of the fisrt car of each lane
                mapingLanePosY["North-right"] = centerNordCarY ;
                mapingLanePosY["South-right"] = centerSudCarY ;
                mapingLanePosY["West-right"] = centerWestCarY ;// center of the right road
                mapingLanePosY["East-right"] =centerEastCarY ;// center of the right road

                nbCarEachLane["North-right"] = 0;
                nbCarEachLane["South-right"] = 0;
                nbCarEachLane["West-right"] = 0;
                nbCarEachLane["East-right"] = 0;
               
            break;
    
            case 2:
                imgBackground.src = "image/background_2.png";

                //empty my table zone
                Zone = [];

                var internalZone=[];
                var criticalZone=[];

                internalZone['West-right'] = 375;internalZone['East-right'] = 625; internalZone['North-right'] = 175;internalZone['South-right'] = 425;
                criticalZone['West-right'] = 445;criticalZone['East-right'] = 555; criticalZone['North-right'] = 260; criticalZone['South-right'] = 360; 
                var Zone1 = {internalZone, criticalZone};

                var internalZone=[];
                var criticalZone=[];
                internalZone['West-right'] = 375;internalZone['East-right'] = 625; internalZone['North-right'] = 535;internalZone['South-right'] = 795;
                criticalZone['West-right'] = 445;criticalZone['East-right'] = 555; criticalZone['North-right'] = 610; criticalZone['South-right'] = 715;
                var Zone2 = {internalZone, criticalZone};

                Zone.push(Zone1);
                Zone.push(Zone2);

               
                
                CreateAllCars(2);

                // Define the position of road
                centerNordCarX = widthBackground / 2 - lengthRoad / 2;
                centerSudCarX = widthBackground / 2 - lengthRoad / 2 + widthCar ;
                centerWestCarX = pos1stCar ;
                centerEastCarX = widthBackground - pos1stCar - widthCar;

                centerNordCarY = pos1stCar;
                centerSudCarY = heightBackground - pos1stCar - heightCar;
                centerWestCarY = 2*heightBackground / 7 + lengthRoad / 2 - heightCar / 2; // center of the right road
                centerEastCarY = 2*heightBackground / 7 - lengthRoad / 2 + heightCar / 2; // center of the right road
                
                mapingLanePosX["North-right"] = centerNordCarX;// center of the right road
                mapingLanePosX["South-right"] = centerSudCarX;// center of the right road
                mapingLanePosX["West-right"] = centerWestCarX ;
                mapingLanePosX["East-right"] = centerEastCarX ;

                // Set the position Y of the fisrt car of each lane
                mapingLanePosY["North-right"] = centerNordCarY ;
                mapingLanePosY["South-right"] = centerSudCarY ;
                mapingLanePosY["West-right"] = centerWestCarY ;// center of the right road
                mapingLanePosY["East-right"] =centerEastCarY ;// center of the right road

                nbCarEachLane["North-right"] = 0;
                nbCarEachLane["South-right"] = 0;
                nbCarEachLane["West-right"] = 0;
                nbCarEachLane["East-right"] = 0;
               
            break;
    
            case 3:
            
                imgBackground.src = "image/background_3.png";

                Zone = [];

                var internalZone=[];
                var criticalZone=[];

                internalZone['West-right'] = 175;internalZone['East-right'] = 425; internalZone['North-right'] = 175;internalZone['South-right'] = 425;
                criticalZone['West-right'] = 245;criticalZone['East-right'] = 355; criticalZone['North-right'] = 260; criticalZone['South-right'] = 360; 
                var Zone1 = {internalZone, criticalZone};

                var internalZone=[];
                var criticalZone=[];
                internalZone['West-right'] = 535;internalZone['East-right'] = 785; internalZone['North-right'] = 175;internalZone['South-right'] = 425;
                criticalZone['West-right'] = 605;criticalZone['East-right'] = 715; criticalZone['North-right'] = 260; criticalZone['South-right'] = 360;
                var Zone2 = {internalZone, criticalZone};

                var internalZone=[];
                var criticalZone=[];
                internalZone['West-right'] = 175;internalZone['East-right'] = 425; internalZone['North-right'] = 530;internalZone['South-right'] = 780;
                criticalZone['West-right'] = 245;criticalZone['East-right'] = 355; criticalZone['North-right'] = 615; criticalZone['South-right'] = 715;
                var Zone3 = {internalZone, criticalZone};

                var internalZone=[];
                var criticalZone=[];
                internalZone['West-right'] = 530;internalZone['East-right'] = 785; internalZone['North-right'] = 530;internalZone['South-right'] = 785;
                criticalZone['West-right'] = 600;criticalZone['East-right'] = 715; criticalZone['North-right'] = 610; criticalZone['South-right'] = 715;
                var Zone4 = {internalZone, criticalZone};

 
                Zone.push(Zone1,Zone2,Zone3,Zone4);
                
           
                CreateAllCars(3);

                // Define the position of road
                centerNordCarX = 5*widthBackground / 7 - 2*lengthRoad ;
                centerSudCarX = 5*widthBackground / 7 - 2*lengthRoad  + widthCar ;
                centerWestCarX = pos1stCar ;
                centerEastCarX = widthBackground - pos1stCar - widthCar;

                centerNordCarY = pos1stCar;
                centerSudCarY = heightBackground - pos1stCar - heightCar;
                centerWestCarY = 2*heightBackground / 7 + lengthRoad / 2 - heightCar / 2; // center of the right road
                centerEastCarY = 2*heightBackground / 7 - lengthRoad / 2 + heightCar / 2; // center of the right road
                
                mapingLanePosX["North-right"] = centerNordCarX;// center of the right road
                mapingLanePosX["South-right"] = centerSudCarX;// center of the right road
                mapingLanePosX["West-right"] = centerWestCarX ;
                mapingLanePosX["East-right"] = centerEastCarX ;

                // Set the position Y of the fisrt car of each lane
                mapingLanePosY["North-right"] = centerNordCarY ;
                mapingLanePosY["South-right"] = centerSudCarY ;
                mapingLanePosY["West-right"] = centerWestCarY ;// center of the right road
                mapingLanePosY["East-right"] =centerEastCarY ;// center of the right road

                nbCarEachLane["North-right"] = 0;
                nbCarEachLane["South-right"] = 0;
                nbCarEachLane["West-right"] = 0;
                nbCarEachLane["East-right"] = 0;

            break;
    
            default:
            imgBackground.src = "image/background.png";
            

            Zone.push(Zone1);
           // CreateAllCars(1);

            break;
        }

       
        
   
    });   

    console.log(centerNordCarX);
    // Set the position X of the fisrt car of each lane
    


    // Get the context of the canvas element : 
    canvas = document.getElementById('mon_canvas');
    context = canvas.getContext('2d');
    if (!canvas || !context) {
        alert("Impossible de récupérer le context du canvas");
        return;
    }    

};

// Get the json file where car speed for each zones are defined and creates every cars objects
function CreateAllCars(typeConfig) {
    
    if (typeConfig == null)
        typeConfig = 1;

    $.ajax({
        url: "data/car_info_" + typeConfig + "2.json",
        type: 'GET',
        success: function (data, textStatus, jqXHR) {
            console.log(">>> Ajax_success >>>");

            var nbCars = 0;
            for (var j = 0; j < data.sequences.length; j++) {
                var carsfromJson = data.sequences[j].cars;

                // Create every cars and add them to the list (allCars)
                for (var i = 0; i < carsfromJson.length; i++) {
                    // constructor(lane, laneTurn, speed_zone1, speed_zone2, speed_inter, angle, posInLine, color)
                    allCars[nbCars++] = new Car(carsfromJson[i].lane,
                            carsfromJson[i].turn,
                            carsfromJson[i].speed_zone1,
                            carsfromJson[i].speed_zone2,
                            carsfromJson[i].speed_inter,
                            carsfromJson[i].posInLine,
                            data.sequences[j].color);
                }
            }

            console.log(data);
            console.log("<<< Ajax_success <<<");
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
};

// Mange every buttons (Pause, SpeedUp and SpeedDown)
function ManageEventButtons() {
    // Pause the JS when user clic on the button pause (or resume) : 
    var pauseON = false;
    $("#bPause").click(function () {
        if (pauseON) {
            windowsTimer = window.setInterval(Update, delayBetween2display);
            pauseON = false;
        } else {
            window.clearInterval(windowsTimer);
            pauseON = true;
        }
    });

    // Manage the button SpeedDown (<<<)
    $("#bSpeedDown").click(function () {
        delayBetween2display *= 2;
        if (!pauseON) {
            window.clearInterval(windowsTimer);
            windowsTimer = window.setInterval(Update, delayBetween2display);
        }
    });

    // Manage the button SpeedUp (>>>)
    $("#bSpeedUp").click(function () {
        delayBetween2display /= 2;
        if (!pauseON) {
            window.clearInterval(windowsTimer);
            windowsTimer = window.setInterval(Update, delayBetween2display);
        }
    });

};

// Update the model and the View (is called every X ms)
function Update() {
    // Update the model (data)
    UpdateModel();

    // Update the view (draw elements in the canvas)
    DisplayAll();
};

// Update the model (data)
function UpdateModel() {
    // Move every cars and check collide
    for (var i = 0; i < allCars.length; i++) {
        allCars[i].move();
        // Check collide
        for (var j = 0; j < allCars.length; j++) {
            if(i != j){ 
                //Check if both cars are on screen (displayed) and check collide
                if(carOnScreen(allCars[i]) && carOnScreen(allCars[j]))
                    aabbCollide(allCars[i], allCars[j]);  
            }
        }
        
        if(DEBUG){
            carTracePoint[carTrace++] = new CollidePoint((allCars[i].posX+allCars[i].posX+widthCar)/2,
                                                            (allCars[i].posY+allCars[i].posY+heightCar)/2);
            if(carTrace > 500)carTrace =0;
        }
    }
};

function aabbCollide(car1, car2){
    if (car1.posX < car2.posX + widthCar &&
        car1.posX + widthCar > car2.posX &&
        car1.posY < car2.posY + heightCar &&
        heightCar + car1.posY > car2.posY) {
            console.log("collide");
            if(DEBUG)
                collidePoint[nbCollide++] = new CollidePoint((car1.posX+car1.posX+widthCar)/2
                ,(car1.posY+car1.posY+heightCar)/2);
    }
}

function carOnScreen(car){
    if (car.posX < 1000 &&
        car.posX + widthCar > 0 &&
        car.posY < 1000 &&
        heightCar + car.posY > 0) {
          return true
    }
    return false;
}

// Update the view (draw elements in the canvas)
function DisplayAll() {
    // Draw the background (every time to clear the canva)
    context.drawImage(imgBackground, 0, 0);              
    for(var i=0;i<Zone.length;i++)
    {
        //console.log(Zone[i].internalZone);
        // Draw the zone1
        context.beginPath();
        context.rect(Zone[i].internalZone['West-right'], Zone[i].internalZone['North-right'],
                Zone[i].internalZone['East-right'] - Zone[i].internalZone['West-right'], Zone[i].internalZone['South-right'] -Zone[i].internalZone['North-right']);
        context.strokeStyle = "blue";
        context.stroke();

        // Draw the zone2
        context.beginPath();
        context.rect(Zone[i].criticalZone['West-right'], Zone[i].criticalZone['North-right'],
        Zone[i].criticalZone['East-right'] - Zone[i].criticalZone['West-right'], Zone[i].criticalZone['South-right'] -Zone[i].criticalZone['North-right']);
        context.strokeStyle = "red";
        context.stroke();  
    }
    

   // Draw every cars
    for (var i = 0; i < allCars.length; i++) {
        allCars[i].display(context);
    }

    if(DEBUG){

        for (var i = 0; i < allCars.length; i++) {
    
            centerX = (allCars[i].posX+allCars[i].posX+widthCar)/2;
            centerY = (allCars[i].posY+allCars[i].posY+heightCar)/2;
            nextCposY =centerY + 20 * Math.sin(allCars[i].angle * TO_RADIANS);
            nextCposX =centerX + 20 * Math.cos(allCars[i].angle * TO_RADIANS);
            
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(nextCposX, nextCposY);
            context.stroke();
    
        }
        //Draw car path point
        for (var i = 0; i < carTracePoint.length; i++) {
            carTracePoint[i].display(context, "red");
        }
    }

      //Draw collision point
      for (var i = 0; i < collidePoint.length; i++) {
        collidePoint[i].display(context, "blue");
    }
};