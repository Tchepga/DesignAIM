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
var Zone1 = Array();
var Zone2 = Array();

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
        //We will check the lane where the car is situated , and which zone he is currently in , and then adapt the speed depending on these 2 factors
        switch (this.lane) {
            case "North-right":
                //For exemple if we are on the north lane , we will check the coordinates of the car and zones (because zones have been delimited earlier in the program
                //and then after checking , if the coordinates of the car is in a certain zone , we will change the speed , here we check if we are outside of zone 2 and then in zone 1
                if (this.posY + heightCar >= Zone2["South-right"] || this.posX + widthCar >= Zone2["East-right"] || this.posX + widthCar <= Zone2["West-right"]) {
                    speed = this.speed_zone1;
                    //here we check if we are in zone intersection
                } else if (this.posY + heightCar >= Zone2[this.lane]) {
                    speed = this.speed_inter;
                    //here we check if we are in zone 2
                } else if (this.posY + heightCar >= Zone1[this.lane]) {
                    speed = this.speed_zone2;
                    //here we check if we are in zone 1
                } else {
                    speed = this.speed_zone1;
                }

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "East-left") {
                    var posStartTurning = Zone2['North-right'] - widthCar;
                    var distInInter = this.posY - posStartTurning;
                    if (distInInter > 0)
                        this.angle = 90 + (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "West-left") {
                    var posStartTurning = Zone2['North-right'];
                    var distInInter = this.posY - posStartTurning;
                    if (distInInter > 0)
                        this.angle = 90 - (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "South-right":
                // Find the correct car speed : 
               
                if (this.posY <= Zone2[this.lane]) {
                    speed = this.speed_inter;
                } else if (this.posY <= Zone1[this.lane]) {
                    speed = this.speed_zone2;
                } else {
                    speed = this.speed_zone1;
                }

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "East-left") {
                    var posStartTurning = Zone2['South-right'];
                    var distInInter = posStartTurning - this.posY;
                    if (distInInter > 0)
                        this.angle = 270 + (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "West-left") {
                    var posStartTurning = Zone2['South-right'] - widthCar;
                    var distInInter = posStartTurning - this.posY;
                    if (distInInter > 0)
                        this.angle = 270 - (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "East-right":
                // Find the correct car speed : 
                if (this.posX <= Zone2["West-right"] || this.posY >= Zone2["South-right"] || this.posY <= Zone2["North-right"]) {
                    speed = this.speed_zone1;
                } else if (this.posX <= Zone2[this.lane]) {
                    speed = this.speed_inter;
                } else if (this.posX <= Zone1[this.lane]) {
                    speed = this.speed_zone2;
                } else {
                    speed = this.speed_zone1;
                }

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "South-left") {
                    var posStartTurning = Zone2['East-right'] - widthCar;
                    var distInInter = posStartTurning - this.posX;
                    if (distInInter > 0)
                        this.angle = 180 - (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "North-left") {
                    var posStartTurning = Zone2['East-right'];
                    var distInInter = posStartTurning - this.posX;
                    if (distInInter > 0)
                        this.angle = 180 + (90 * distInInter) / sizeAreaWhereCarTurn;
                }

                break;

            case "West-right":
                // Find the correct car speed : 
                if (this.posX + widthCar >= Zone2["East-right"] || this.posY + heightCar >= Zone2["South-right"] || this.posY + heightCar <= Zone2["North-right"]) {
                    speed = this.speed_zone1;
                } else if (this.posX + widthCar >= Zone2[this.lane]) {
                    speed = this.speed_inter;
                } else if (this.posX + widthCar >= Zone1[this.lane]) {
                    speed = this.speed_zone2;
                } else {
                    speed = this.speed_zone1;
                }

                // Find the correct car angle : update the angle of the car depending to the distance of the car in the intersection (distInInter)
                if (this.laneTurn == "South-left") {
                    var posStartTurning = Zone2['West-right'] - widthCar;
                    var distInInter = this.posX - posStartTurning;
                    if (distInInter > 0)
                        this.angle = (90 * distInInter) / sizeAreaWhereCarTurn;
                } else if (this.laneTurn == "North-left") {
                    var posStartTurning = Zone2['West-right'];
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
    console.log( $( "#validate" ));

    // InitGloabalVars();

    // CreateAllCars();

    // The function Update will be called each delayBetween2display ms
    //windowsTimer = window.setInterval(Update, delayBetween2display);

    //ManageEventButtons();
};

function InitGloabalVars() {

    // set configuration
    $( "#validate" ).onclick(function( event ) {
        console.log( "Validation de Data" );
        //event.preventDefault();
      });

    // Set the default values for every global variable
    widthBackground = 1000;
    heightBackground = 1000;
    imgBackground.src = "image/background.png";

    widthCar = 20;
    heightCar = 20;
    // By default the first car of each lane is 300px before the screan
    pos1stCar = -300;

    lengthRoad = 40;
    spaceBetweenCar = 50;
    sizeAreaWhereCarTurn = 50;
    //32ms between 2 display -> 60Fps
    delayBetween2display = 32;

    // Set the position X of the fisrt car of each lane
    mapingLanePosX["North-right"] = widthBackground / 2 - lengthRoad / 2 - widthCar / 2;// center of the right road
    mapingLanePosX["South-right"] = widthBackground / 2 + lengthRoad / 2 - widthCar / 2;// center of the right road
    mapingLanePosX["West-right"] = pos1stCar;
    mapingLanePosX["East-right"] = widthBackground - pos1stCar - widthCar;

    // Set the position Y of the fisrt car of each lane
    mapingLanePosY["North-right"] = pos1stCar;
    mapingLanePosY["South-right"] = heightBackground - pos1stCar - heightCar;
    mapingLanePosY["West-right"] = heightBackground / 2 + lengthRoad / 2 - heightCar / 2;// center of the right road
    mapingLanePosY["East-right"] = heightBackground / 2 - lengthRoad / 2 - heightCar / 2;// center of the right road

    nbCarEachLane["North-right"] = 0;
    nbCarEachLane["South-right"] = 0;
    nbCarEachLane["West-right"] = 0;
    nbCarEachLane["East-right"] = 0;

    // Set the position (X and Y) both Zones 
    Zone1['West-right'] = 225;
    Zone1['East-right'] = 775;
    Zone1['North-right'] = 225;
    Zone1['South-right'] = 775;
    Zone2['West-right'] = 450;
    Zone2['East-right'] = 550;
    Zone2['North-right'] = 450;
    Zone2['South-right'] = 550;


    // Get the context of the canvas element : 
    canvas = document.getElementById('mon_canvas');
    context = canvas.getContext('2d');
    if (!canvas || !context) {
        alert("Impossible de récupérer le context du canvas");
        return;
    }    
};

// Get the json file where car speed for each zones are defined and creates every cars objects
function CreateAllCars() {
    var url = new URL(window.location.href);
    var numInputFile = url.searchParams.get("numInputFile");
    if (numInputFile == null)
        numInputFile = 2;

    /*$.ajax({
        url: "data/car_info_" + numInputFile + ".json",
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

           // console.log(data);
            console.log("<<< Ajax_success <<<");
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });*/
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
           // if(DEBUG)
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
    
    // Draw the zone1
    context.beginPath();
    context.rect(Zone1['West-right'], Zone1['North-right'], Zone1['East-right'] - Zone1['West-right'], Zone1['South-right'] - Zone1['North-right']);
    context.strokeStyle = "blue";
    context.stroke();

    // Draw the zone2
    context.beginPath();
    context.rect(Zone2['West-right'], Zone2['North-right'], Zone2['East-right'] - Zone2['West-right'], Zone2['South-right'] - Zone2['North-right']);
    context.strokeStyle = "red";
    context.stroke();

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