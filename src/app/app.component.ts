import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery';
import * as cuid from "cuid";
import {addContestant, Contestant, createContestants, removeContestant} from '../scripts/contestant';
import {addColor, colorPatterns, colorSelection, createColors, removeColor, resetColors} from "../scripts/colors";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // Hex Tester
  hexTest = /[0-9A-Fa-f]{6}/g;

  // Inputs
  color: string;
  colorSelector: any;
  colorPatterns: any;
  contestant: string;
  dialOrientation: any;
  // Tabs
  tabs: any;
  settingInputs: any;

  tables: {colors: string[], contestants: Contestant[]}

  // Wheel
  wheelRotation: any;
  winnerModal: any;
  cssAnimation: any;

  // Constructor
  constructor(private router: Router) {
    this.color = '#';
    this.colorSelector = 'Pattern Selection';
    this.colorPatterns = colorPatterns;
    this.cssAnimation = document.createElement('style');
    this.dialOrientation = [['O', 'O', 'O'], ['O', 'R', 'X'], ['O', 'O', 'O']];
    this.tables = {colors: [], contestants: []}
    this.settingInputs = {
      bgColor: '#00b140',
      sBColor: '#c3ecf8',
      acColor: '#ffffff',
      mColor: '#ffffff',
      mFColor: '#000000',
      mWColor: '#000000dd',
      fontColor: '#000000',
      wheelSize: 720,
      fontSize: 48,
      spinTime: 10,
      spinRate: 1.1,
      dialSize: 50,
      dialLocation: 0
    };


    this.tabs = ['Contestants', 'Colors', 'Settings'];
    this.wheelRotation = {dialLocation: 0, rate: 1.1, timer: 0, counter: 0, totalRot: 0, rotation: 0};
    this.winnerModal = {winnerText: 'Winner: ', winner: ''};
    // Checks the Local Storage to See if there is a registry saved from before if not then creates Four default names
    this.tables.contestants = createContestants(JSON.parse(sessionStorage.getItem('contestants')));
    // Checks the Local Storage to See if there is a registry saved from before if not then creates two default colors
    this.tables.colors = createColors(JSON.parse(sessionStorage.getItem('colors')));
    resetColors(this.tables.contestants, this.colorSelector);

    this.cssAnimation.type = 'text/css';
  }

  ngAfterViewInit() {
    document.body.style.backgroundColor = this.settingInputs.bgColor; // Green Screen Color
    this.canvas = document.getElementById('cnvs') as HTMLCanvasElement; // Gets the Canvas Element
    this.ctx = this.canvas.getContext('2d'); // Context is 2d for the canvas
    this.settingInputs.wheelSize = this.canvas.height;

    this.setWheelSize();
    this.refreshWheel(); // Calls the function Refresh Wheel

    $('#sliceColor').change(() => this.addWheelColor());
    $('#acColor').change(() => this.setAccentColor());
    $('#bgColor').change(() => this.setPageColors());
    $('#mColor').change(() => this.setPageColors());
    $('#mFColor').change(() => this.setPageColors());
    $('#mWColor').change(() => this.setPageColors());
    $('#sBColor').change(() => this.setPageColors());

    // const dialSize = document.getElementById('dialSize');
    // dialSize.addEventListener('change', () => this.setDialSize());
    window.onresize = (e) => this.setWheelSize();
  }


  // Adds Color
  addWheelColor() {
    addColor(this.color, () => {
      this.color = '';
      this.refreshWheel();
    });
  }

  // Adds Contestant
  addPeople() {
    addContestant(this.contestant, () => this.refreshWheel());
  }

  // Checks Contestant Winner
  checkWinner() {
    this.wheelRotation.rotation = this.wheelRotation.totalRot % 360; // Gets the mod of the total rotation and sets rotation to that
    this.tables.contestants.forEach((contestant) => { // Iterates through each Contestant
      const leftBound = ((180 * contestant.sAngle) / (Math.PI) + this.wheelRotation.rotation) % 360, // This gets the left bound angle of the contestant converts to Degrees and then adds the current rotation to that, then gets the mod of that
        rightBound = ((180 * contestant.eAngle) / (Math.PI) + this.wheelRotation.rotation) % 360; // Does the same of the above bond angle except with the ending bound
      if (leftBound < rightBound) { // Checks to see if the left bound is greater than the right bound
        if (this.wheelRotation.dialLocation >= leftBound && this.wheelRotation.dialLocation <= rightBound) { //Checks to see if the dial is inbetween the bounds
          this.winnerModal.winner = contestant.name; // Sets the winner
        }
      } else {
        if (this.wheelRotation.dialLocation <= leftBound && this.wheelRotation.dialLocation <= rightBound) {  // Checks to see if the bounds looping around has the dial between it
          this.winnerModal.winner = contestant.name; // Sets the winner
        }
      }
    });

  }

  // Recieved from https://www.sitepoint.com/javascript-generate-lighter-darker-color/, allows for easy changing of hex format to be increase or decreased based on a percent value
  colorLum(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    let rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }


  changeOrientation() {
    let dial = document.getElementById('dial').style; // Gets the Dial
    let dialImg = document.getElementById('dial').getElementsByTagName('img')[0].style; // Gets the Dial
    let topMargin = 64 + 8 + 101;
    if (this.wheelRotation.dialLocation === 0) { // Sets the dial location for the first position 000 00X 000
      dial.top = topMargin + this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 2 + 'px';
      dial.marginLeft = (this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 4) + 'px';
    } else if (this.wheelRotation.dialLocation === 45) { // Sets the dial location for the second position 000 000 00X
      if (window.innerWidth < 767) {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 + 8 + 'px';
      } else if (window.innerWidth < 1024) {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize / 2 + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 8 + 'px';
      } else if (window.innerWidth < 1280) {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize / 2 + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 8 + 'px';
      } else {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize * 1.5 + 8 + 'px';
      }
    } else if (this.wheelRotation.dialLocation === 90) { // Sets the dial location for the third position 000 000 0X0
      dial.top = this.settingInputs.wheelSize + this.settingInputs.dialSize + 'px';
      dial.marginLeft = this.settingInputs.dialSize / 2 + 'px';
    } else if (this.wheelRotation.dialLocation === 135) { // Sets the dial location for the fourth position 000 000 X00

      if (window.innerWidth < 767) {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize / 2 + topMargin + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) - this.settingInputs.dialSize / 2 + 11) + 'px';
      } else if (window.innerWidth < 1024) {
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 - 8) + 'px';
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize + topMargin + 'px';
      } else if (window.innerWidth < 1280) {
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 + 8) + 'px';
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize * 1.5 + topMargin + 'px';
      } else {
        dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize * 1.5 + topMargin + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 + 8) + 'px';
      }
    } else if (this.wheelRotation.dialLocation === 180) { // Sets the dial location for the fifth position 000 X00 000
      dial.top = this.settingInputs.wheelSize / 2 + this.settingInputs.dialSize / 2 + topMargin + 'px';
      dial.marginLeft = -1 * (this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 4) + 'px';
    } else if (this.wheelRotation.dialLocation === 225) { // Sets the dial location for the sixth position X00 000 000
      if (window.innerWidth < 767) {
        dial.top = topMargin + this.settingInputs.wheelSize / 4 + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 + 8) + 'px';
      } else if (window.innerWidth < 1024) {
        dial.top = this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize / 2 + topMargin + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 8) + 'px';
      } else if (window.innerWidth < 1280) {
        dial.top = this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize / 2 + topMargin + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 8) + 'px';
      } else {
        dial.top = this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize + topMargin + 'px';
        dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + this.settingInputs.dialSize / 2 + 8) + 'px';
      }
    } else if (this.wheelRotation.dialLocation === 270) { // Sets the dial location for the seventh position 0X0 000 000
      dial.top = -16 + this.settingInputs.dialSize / 2 + topMargin + 'px';
      dial.marginLeft = -1 * this.settingInputs.dialSize / 2 + 'px';
    } else if (this.wheelRotation.dialLocation === 315) { // Sets the dial location for the eigth position 00X 000 000
      dial.top = this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize + topMargin + 'px';
      if (window.innerWidth < 767) {
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + 'px';
      } else if (window.innerWidth < 1024) {
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 4 + 'px';
      } else if (window.innerWidth < 1280) {
        dial.top = -12 + this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize / 2 + 'px';
      } else {
        dial.top = -8 + this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize * 1.5 + topMargin + 'px';
        dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 'px';
      }

    }
    dial.transform = 'rotate(' + this.wheelRotation.dialLocation + 'deg)'; // Rotates the dial to whatever is selected as the location

  }

  changeTab(tab, i) {
    // Sets all variables to document Items
    let btnAr = document.getElementsByClassName('tabButtons').item(0),
      tabAr = [document.getElementById('contestantsTab'), document.getElementById('colorsTab'), document.getElementById('settingsTab')];

    for (let x = 0; x < btnAr.children.length; x++) { // Resets the current active tab
      let y = $('#' + tabAr[x].id).css;
    }
    btnAr.children.item(i).className = 'active';  // Sets the current Tab
    tabAr[tabAr.indexOf(tabAr.find((child) => child.id.toLowerCase().includes(tab.toLowerCase())))].className = ''; // Sets the current shown tab based on tab clicked.
  }

  // Converts from Degrees to Radians
  degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // Get Random Value between two Values
  getRBwVal(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Get Random Int between two Values
  getRInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // Min is inclusive, Max is Exclusive
  }

  disableModal() {
    document.getElementById('winnerModal').className = 'disabled';
    document.getElementById('winnerModal').style.animation = '';
  }

  // Draws the Names onto The segments of the Wheel
  drawSegmentLabel(canvas, context, contestant, i, cenX, cenY) {
    context.save(); // Saves the context
    context.translate(cenX, cenY); // Moves context to the center of the circle
    context.rotate(contestant.sAngle); // Rotates the context to the angle at which the contestants angle starts
    const dx = Math.floor(canvas.width * 0.5) - 10; // Starts the
    const dy = Math.floor(canvas.height * 0.05) - 10; //

    context.textAlign = 'right'; // Alighs the text to the right
    const fontSize = Math.floor(canvas.height / 30); // Determines that size of the font  ***** Will be changed
    context.font = fontSize + 'pt Helvetica'; // Picks the font and size of the segment label

    context.fillText(contestant.name, dx, dy);

    context.restore();
  }

  // Draws each individual segment of the Wheel
  drawSegment(canvas, context, angleSpacing, contestant, i) {
    context.save(); // Saves the context of the canvas
    const cenX = Math.floor(canvas.width / 2), // Finds the center of the canvas' width
      cenY = Math.floor(canvas.height / 2), // Finds the center of the canvas' height
      rad = Math.floor(canvas.width / 2), // Finds the radius of the circle, using the canvas width
      arcSize = this.degToRad(angleSpacing); // Turns the degrees to Radians of the angle spacing to get the size of the arc on the circle
    contestant.sAngle = this.degToRad(angleSpacing * i), // Gives the point at which the arc will be drawn in Radians
      contestant.eAngle = contestant.sAngle + arcSize; // Finds the end point at which the slice can be drawn

    context.beginPath(); // Starts the path
    context.moveTo(cenX, cenY); // Moves to the center
    context.arc(cenX, cenY, rad, contestant.sAngle, contestant.eAngle, false); // Makes an arc
    context.closePath(); // Ends the path
    context.lineWidth = 5;
    if (!!(this.settingInputs.customImage)) {
      context.strokeStyle = 'gray';
      context.stroke();
    } else {
      context.fillStyle = contestant.sColor; // Finds the color of the slice
      context.fill(); // Fills the color
    }
    context.restore(); // This method restores the most recently saved canvas state by popping the top entry in the drawing state stack

    this.drawSegmentLabel(canvas, context, contestant, i, cenX, cenY); // Calls the function draw Segment Label,
  }

  // Refreshes the Wheel
  refreshWheel() {
    const angleSpacing = 360 / this.tables.contestants.length; // Creates the variable angleSpacing which represents the amount angle that each contestant will take up on the circle
    resetColors(this.tables.contestants, this.colorSelector); // Calls the function reset Colors
    this.setPageColors();
    for (let [i, contestant] of this.tables.contestants.entries()) {
      this.drawSegment(this.canvas, this.ctx, angleSpacing, contestant ,i);
    }
  }

  // Removes the Selected Contestant
  removeSelectedContestant(id) {
    removeContestant(id, ()=> this.refreshWheel());
  }


  // Removes the Selected Color
  removeSelectedColor(Color: string) {
    removeColor(Color, ()=> {
      resetColors(this.tables.contestants, this.colorSelector);
      this.refreshWheel();
    });
  }

  resetBgColor() {
    this.settingInputs.bgColor = '#00b140';
    document.body.style.backgroundColor = this.settingInputs.bgColor;
  }

  // Rotation of the Wheel
  rotateWheel(id, rTimer) { // Rate of Rotation at any given second
    this.wheelRotation.counter += 0.1; // Counter for the interval
    let reverseTimer = rTimer - this.wheelRotation.counter;
    if (this.wheelRotation.counter > rTimer) { // Checks to see if it should stop spinning
      clearInterval(id); // Removes The Interval
      document.getElementById('cnvs').appendChild(this.cssAnimation);
      setTimeout(() => {
        document.getElementById('spinbtn').classList.remove('disabled');
      }, this.settingInputs.spinTime); // Removes the field of disabled to the Spin Button
      this.checkWinner(); // Calls the check winner function
      document.getElementById('winnerModal').className = '';
      document.getElementById('winnerModal').style.animation = 'fade-in 1s forwards';
    } else {
      this.wheelRotation.totalRot += this.wheelRotation.rate;
      if (reverseTimer < rTimer / 5.5) {
        this.wheelRotation.rate = (((reverseTimer) * .00390625) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 5) {
        this.wheelRotation.rate = ((reverseTimer * .0078125) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 4.5) {
        this.wheelRotation.rate = ((reverseTimer * .015625) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 4) {
        this.wheelRotation.rate = ((reverseTimer * .03125) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 3.5) {
        this.wheelRotation.rate = ((Math.random() * reverseTimer * .0625) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 3) {
        this.wheelRotation.rate = ((Math.random() * reverseTimer * .125) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 2.5) {
        this.wheelRotation.rate = ((Math.random() * reverseTimer * .25) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else if (reverseTimer < rTimer / 2) {
        this.wheelRotation.rate = ((Math.random() * reverseTimer * .5) / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      } else {
        this.wheelRotation.rate = ((Math.random() * reverseTimer) + reverseTimer / (this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate * this.settingInputs.spinRate));
      }

      document.getElementById('cnvs').style.transform = `rotate(${this.wheelRotation.totalRot}deg)`; // Rotates the canvas by the
    }
  }

  selectPattern(pattern) {
    this.colorSelector = pattern;
    this.refreshWheel();
  }

  setDialOrientation(x, y, col) {
    if (col.includes('X')) {
      return;
    } else if (col.includes('R')) {
      const x2 = Math.floor(Math.random() * this.dialOrientation.length);
      const y2 = Math.floor(Math.random() * this.dialOrientation.length);
      return this.setDialOrientation(x2, y2, this.dialOrientation[x2][y2]);
    } else {
      const dialLocationValues = [[225, 270, 315], [180, null, 0], [135, 90, 45]];
      this.wheelRotation.dialLocation = dialLocationValues[x][y];
      for (let i = 0; i < this.dialOrientation.length; i++) {
        for (let j = 0; j < this.dialOrientation[i].length; j++) {
          if (!this.dialOrientation[i][j].includes('R')) {
            this.dialOrientation[i][j] = 'O';
          }
        }
      }
      this.dialOrientation[x][y] = 'X';
      this.changeOrientation();
    }
    return;
  }

  setDialSize() {
    let dial = document.getElementById('dial').style;
    dial.width = this.settingInputs.dialSize;
    dial.height = this.settingInputs.dialSize;
    this.changeOrientation();
  }

  setAccentColor() {
    $('.accentColor').css('backgroundColor', this.settingInputs.acColor);
    $('.accentTableColor').css('backgroundColor', this.colorLum(this.settingInputs.acColor, 0.2));

  }

  setFontColor() {
    $('.fontColor').css('color', this.settingInputs.fontColor);
  }

  setPageColors() {
    document.body.style.backgroundColor = this.settingInputs.bgColor; // Sets the Background Color
    document.getElementById('winnerModal').style.backgroundColor = this.settingInputs.mWColor + 'dd'; // Sets the Wrapper Winner Modal Background
    document.getElementById('winnerModal').getElementsByTagName('div')[0].style.backgroundColor = this.settingInputs.mColor; // Sets the Winner Modal Background
    document.getElementById('winnerModal').style.color = this.settingInputs.mFColor; // Sets the Settings Table
    // Sets the Settings Table
    for (let i = 0; i < document.getElementsByClassName('tabHeader').length; i++) {
      document.getElementsByClassName('tabHeader').item(0).getElementsByTagName('div')[i].style.borderBottom = this.colorLum(this.settingInputs.acColor, 0.2) + '1px dashed';
    }
    document.getElementById('tabButtons').style.backgroundColor = this.settingInputs.acColor; // Sets the tab buttons
    document.getElementById('tabButtons').style.color = this.settingInputs.fontColor; // Sets the tab buttons

    for (let x = 0; x < document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div').length; x += 4) { // Sets the individual rows of the Contestants Table
      document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div')[x].style.backgroundColor = this.settingInputs.acColor;
    }
    for (let x = 2; x < document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div').length; x += 4) { // Sets the odd Rows of the Contestants table to be 10% darker.
      document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div')[x].style.backgroundColor = this.colorLum(this.settingInputs.acColor, -0.1);
    }
  }

  setWheelSize() {
    if (window.innerWidth <= 320) {
      this.settingInputs.wheelSize = 220;
    } else if (320 < window.innerWidth && window.innerWidth <= 480) {
      this.settingInputs.wheelSize = 280;
    } else if (480 < window.innerWidth && window.innerWidth <= 767) {
      this.settingInputs.wheelSize = 360;
    } else if (768 < window.innerWidth && window.innerWidth <= 1024) {
      this.settingInputs.wheelSize = 480;
    } else if (1024 < window.innerWidth && window.innerWidth <= 1280) {
      this.settingInputs.wheelSize = 640;
    } else if (window.innerWidth > 1280) {
      this.settingInputs.wheelSize = 720;
    }
    this.refreshWheel();
    this.changeOrientation();
  }


  // Spin Function
  spinWheel() {
    this.wheelRotation.counter = 0;
    this.wheelRotation.rate = parseFloat(JSON.parse(JSON.stringify(this.settingInputs.spinRate))) * 1.238756;
    document.getElementById('spinbtn').classList.add('disabled'); // Adds the field of disabled to the Spin Button
    this.wheelRotation.timer = (100 * this.settingInputs.spinTime); // The total timer, each 10 is a second, each digit increase is a 10 degree turn. 36 = 3.6 seconds and a complete 360 degree rotation if the rate is at 1.
    const intervalId = setInterval(() => this.rotateWheel(intervalId, this.wheelRotation.timer), 1);
  }
}
