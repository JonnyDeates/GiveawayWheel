///<reference path="../scripts/utlilities.ts"/>
import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import * as $ from 'jquery';
import * as cuid from "cuid";
import {addContestant, clearContestants, Contestant, createContestants, removeContestant} from '../scripts/contestant';
import {addColor, colorPatterns, colorSelection, createColors, removeColor, resetColors} from "../scripts/colors";
import {createSettings, Settings} from "../scripts/settings";
import {colorLum, degToRad} from "../scripts/utlilities";
import {changeDialOrientation, dialOrientation} from "../scripts/wheel";

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
  colorSelector: string;
  colorPatterns: string[];
  contestant: string;
  dialOrientation: any;
  // Tabs
  tabs: any;
  tabNames: string[];
  settingInputs: Settings;

  modals: { winner: boolean, pasteList: { active: boolean, pasteContestants: string, overideContestants: boolean }, }
  tables: { colors: string[], contestants: Contestant[] }

  // Wheel
  wheelRotation: { dialLocation: number, rate: number, timer: number, counter: number, totalRot: number, rotation: number };
  winnerModal: { winnerText: string, winner: string, winnerImg: string };
  cssAnimation: any;

  // Constructor
  constructor(private router: Router) {
    this.color = '#';
    this.colorSelector = 'Pattern Selection';
    this.colorPatterns = colorPatterns;
    this.dialOrientation = dialOrientation;
    this.tables = {colors: [], contestants: []}
    this.tabs = {Contestants: true, Colors: false, Setting: false};
    this.modals = {winner: false, pasteList: {active: false, pasteContestants: '', overideContestants: false}};
    this.tabNames = Object.keys(this.tabs)
    this.wheelRotation = {dialLocation: 0, rate: 1.1, timer: 0, counter: 0, totalRot: 0, rotation: 0};
    this.winnerModal = {winnerText: 'Winner: ', winner: '', winnerImg: ''};

    // Checks the Local Storage to See if there is a registry saved from before if not then creates default settings
    this.settingInputs = createSettings(JSON.parse(sessionStorage.getItem('settings')));
    // Checks the Local Storage to See if there is a registry saved from before if not then creates Four default names
    this.tables.contestants = createContestants(JSON.parse(sessionStorage.getItem('contestants')));
    // Checks the Local Storage to See if there is a registry saved from before if not then creates two default colors
    this.tables.colors = createColors(JSON.parse(sessionStorage.getItem('colors')));
    resetColors(this.tables.contestants, this.colorSelector);

    this.cssAnimation = document.createElement('style');
    this.cssAnimation.type = 'text/css';
  }

  ngAfterViewInit() {
    document.body.style.backgroundColor = '#abfcff'; // Green Screen Color
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
  addPerson() {
    addContestant(this.contestant, () => this.refreshWheel());
    this.contestant = '';
  }

  addPeople() {
    let participantList = this.modals.pasteList.pasteContestants.split(/\n/);
    console.log(participantList);

    participantList = participantList.filter(str => str.trim() !== '');
    console.log(participantList);
    if (this.modals.pasteList.overideContestants && participantList.length > 0) {
      clearContestants(() => {
        for (let participant of participantList) {
          addContestant(participant.trim(), () => {
            this.refreshWheel();
          });
        }
      })
    } else {
      for (let participant of participantList) {
        addContestant(participant.trim(), () => {
          this.refreshWheel();
        });
      }
    }
    this.modals.pasteList.pasteContestants = '';
    this.togglePasteList();
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

  toggleWinnerModal() {
    this.modals.winner = !this.modals.winner;
  }

  togglePasteList() {
    this.modals.pasteList.active = !this.modals.pasteList.active;
  }

  changeOrientation() {
    let dial = document.getElementById('dial').style; // Gets the Dial
    let dialImg = document.getElementById('dial').getElementsByTagName('img')[0].style; // Gets the Dial
    let topMargin = 64 + 8 + 101;
    console.log(dial,  this.settingInputs.wheelSize, this.settingInputs.dialSize, this.wheelRotation.dialLocation)
    let dialChanges = changeDialOrientation(this.settingInputs.wheelSize, this.settingInputs.dialSize, topMargin, this.wheelRotation.dialLocation)
    dial.top = dialChanges.top;
    dial.marginLeft = dialChanges.marginLeft;
    // Rotates the dial to whatever is selected as the location
    dial.transform = 'rotate(' + this.wheelRotation.dialLocation + 'deg)';
  }

  changeTab(tab) {
    this.tabs[tab] = true;
    let x = this.tabNames.filter(name => name !== tab);
    for (let y of x) {
      this.tabs[y] = false;
    }
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
      arcSize = degToRad(angleSpacing); // Turns the degrees to Radians of the angle spacing to get the size of the arc on the circle
    contestant.sAngle = degToRad(angleSpacing * i), // Gives the point at which the arc will be drawn in Radians
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
      this.drawSegment(this.canvas, this.ctx, angleSpacing, contestant, i);
    }
  }

  // Removes the Selected Contestant
  removeSelectedContestant(id) {
    removeContestant(id, () => this.refreshWheel());
  }


  // Removes the Selected Color
  removeSelectedColor(Color: string) {
    removeColor(Color, () => {
      resetColors(this.tables.contestants, this.colorSelector);
      this.refreshWheel();
    });
  }

  resetBgColor() {
    this.settingInputs.colors.background = '#00b140';
    document.body.style.backgroundColor = this.settingInputs.colors.background;
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

  setAccentColor() {
    $('.accentColor').css('backgroundColor', this.settingInputs.colors.accent);
    $('.accentTableColor').css('backgroundColor', colorLum(this.settingInputs.colors.accent, 0.2));

  }

  setFontColor() {
    $('.fontColor').css('color', this.settingInputs.colors.font);
  }

  setPageColors() {
    //document.body.style.backgroundColor = this.settingInputs.colors.background; // Sets the Background Color
    document.getElementById('winnerModal').style.backgroundColor = this.settingInputs.colors.modalBackground + 'dd'; // Sets the Wrapper Winner Modal Background
    document.getElementById('winnerModal').getElementsByTagName('div')[0].style.backgroundColor = this.settingInputs.colors.modalBackground; // Sets the Winner Modal Background
    document.getElementById('winnerModal').style.color = this.settingInputs.colors.modalFont; // Sets the Settings Table
    // Sets the Settings Table
    for (let i = 0; i < document.getElementsByClassName('tabHeader').length; i++) {
      document.getElementsByClassName('tabHeader').item(0).getElementsByTagName('div')[i].style.borderBottom = colorLum(this.settingInputs.colors.accent, 0.2) + '1px dashed';
    }
    document.getElementById('tabButtons').style.backgroundColor = this.settingInputs.colors.accent; // Sets the tab buttons
    document.getElementById('tabButtons').style.color = this.settingInputs.colors.font; // Sets the tab buttons

    for (let x = 0; x < document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div').length; x += 4) { // Sets the individual rows of the Contestants Table
      document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div')[x].style.backgroundColor = this.settingInputs.colors.accent;
    }
    for (let x = 2; x < document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div').length; x += 4) { // Sets the odd Rows of the Contestants table to be 10% darker.
      document.getElementsByClassName('namesTabTable').item(0).getElementsByTagName('div')[x].style.backgroundColor = colorLum(this.settingInputs.colors.accent, -0.1);
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
    this.wheelRotation.rate = parseFloat(JSON.parse(JSON.stringify(this.settingInputs.spinRate))) * 1.61803398875;
    document.getElementById('spinbtn').classList.add('disabled'); // Adds the field of disabled to the Spin Button
    this.wheelRotation.timer = (100 * this.settingInputs.spinTime); // The total timer, each 10 is a second, each digit increase is a 10 degree turn. 36 = 3.6 seconds and a complete 360 degree rotation if the rate is at 1.
    const intervalId = setInterval(() => this.rotateWheel(intervalId, this.wheelRotation.timer), 1);
  }
}
