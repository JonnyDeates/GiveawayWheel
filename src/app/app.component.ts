import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';

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

  // Contestants
  contestants: any;

  // Inputs
  color: string;
  colorSelector: any;
  colorPatterns: any;
  contestant: string;
  dialOrientation: any;

  // Tabs
  tabs: any;
  settingInputs: any;

  // Wheel
  wheelRotation: any;
  winnerModal: any;
  colors: any[];
  cssAnimation: any;

  // Constructor
  constructor(private router: Router) {
    this.contestants = [];
    this.colors = [];
    this.color = '#';
    this.colorSelector = 'Pattern Selection';
    this.colorPatterns = ['abcd', 'ababcdcd', 'aabccd', 'abbcdd', 'abcb', 'abababcdcdcd', 'random', 'totalRandom'];
    this.cssAnimation = document.createElement('style');
    this.dialOrientation = [['O', 'O', 'O'], ['O', 'R', 'X'], ['O', 'O', 'O']];

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
      spinTime: 100,
      spinRate: 1.1,
      dialSize: 50,
      dialLocation: 0
    };
    this.tabs = ['Contestants', 'Colors', 'Settings'];
    this.wheelRotation = {dialLocation: 0, rate: 1.1, timer: 0, counter: 0, totalRot: 0, rotation: 0};
    this.winnerModal = {winnerText: 'Winner: ', winner: ''};
    // sessionStorage.setItem('contestants', JSON.stringify([{name: 'Jonny', sAngle: 0, eAngle: 0, sColor: '#FFDAB9'},
    //   {name: 'Tom', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
    //   {name: 'ter', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
    //   {name: 'Jeff', sAngle: 0, eAngle: 0, sColor: '#7744ff'}]))
    // Checks the Local Storage to See if there is a registry saved from before if not then creates three default names
    if (!(!!sessionStorage.getItem('contestants'))) {
      this.contestants = [{name: 'Jonny', sAngle: 0, eAngle: 0, sColor: '#FFDAB9'},
        {name: 'Tom', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
        {name: 'ter', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
        {name: 'Jeff', sAngle: 0, eAngle: 0, sColor: '#7744ff'}];
    } else {
      this.contestants = JSON.parse(sessionStorage.getItem('contestants'));
    }
    // Checks the Local Storage to See if there is a registry saved from before if not then creates two default colors
    if (!(!!sessionStorage.getItem('colors'))) {
      this.colors = ['#FFDAB9', '#E6E6FA', '#7744ff'];
    } else {
      this.colors = JSON.parse(sessionStorage.getItem('colors'));
    }

    this.resetColors();
    this.cssAnimation.type = 'text/css';
  }

  ngAfterViewInit() {
    document.body.style.backgroundColor = this.settingInputs.bgColor; // Green Screen Color
    this.canvas = <HTMLCanvasElement> document.getElementById('cnvs'); // Gets the Canvas Element
    this.ctx = this.canvas.getContext('2d'); // Context is 2d for the canvas
    this.changeOrientation();
    this.refreshWheel(); // Calls the function Refresh Wheel
    const sliceColorPicker = document.getElementById('sliceColor');
    sliceColorPicker.addEventListener('change', () => this.addColor());

    const acColorPicker = document.getElementById('acColor');
    acColorPicker.addEventListener('change', () => this.setPageColors());

    const bgColorPicker = document.getElementById('bgColor');
    bgColorPicker.addEventListener('change', () => this.setPageColors());

    const fontColorPicker = document.getElementById('fontColor');
    fontColorPicker.addEventListener('change', () => this.setPageColors());

    const mColorPicker = document.getElementById('mColor');
    mColorPicker.addEventListener('change', () => this.setPageColors());

    const mFColorPicker = document.getElementById('mFColor');
    mFColorPicker.addEventListener('change', () => this.setPageColors());

    const mWColorPicker = document.getElementById('mWColor');
    mWColorPicker.addEventListener('change', () => this.setPageColors());

    const sBColorPicker = document.getElementById('sBColor');
    sBColorPicker.addEventListener('change', () => this.setPageColors());

    const wheelSize = document.getElementById('wheelSize');
    wheelSize.addEventListener('change', () => this.setWheelSize());

    // const dialSize = document.getElementById('dialSize');
    // dialSize.addEventListener('change', () => this.setDialSize());
  }

  // Adds Color
  addColor() {
    if (this.color.trim() === '' || this.testForHex()) {
      alert('Could not add Color, lacking information, needs to be in hex format');
    } else {
      this.colors.push(this.color);
      this.color = '';
      this.refreshWheel();
    }
    sessionStorage.setItem('colors', JSON.stringify(this.colors));
    // this.colors = JSON.parse(localStorage.getItem('colors'));
  }

  // Adds Contestant
  addContestant() {
    if (this.contestant.trim() === '') {
      alert('Could not add Contestant, lacking information');
    } else {
      this.contestants.push({name: this.contestant, sAngle: 0, eAngle: 0, sColor: '#E6E6FA'});
      this.contestant = '';
    }
    sessionStorage.setItem('contestants', JSON.stringify(this.contestants)); // Saves the contestants to the User's Session
    // this.contestants = JSON.parse(sessionStorage.getItem('contestants'));
    this.refreshWheel();
  }

  // Checks Contestant Winner
  checkWinner() {
    this.wheelRotation.rotation = this.wheelRotation.totalRot % 360; // Gets the mod of the total rotation and sets rotation to that
    this.contestants.forEach((contestant) => { // Iterates through each Contestant
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

  // Selects the color based on what the current pattern selected is
  colorSelection(selector) {
    let colorsUsed = [];
    if (this.colors.length > 1) { // Checks to make sure that there is more than 1 color
      if (selector.includes('abababcdcdcd')) { // Creates the pattern shown by adding to itself the color mutliple times.
        for (let i = 0; i < this.colors.length; i += 2) { // Moves 2 at a time so it loops through two colors from ab to cd
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
        }
      } else if (selector.includes('ababcdcd')) {
        for (let i = 0; i < this.colors.length; i += 2) {
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
          colorsUsed.push(this.colors[i]); // Resets colors to be one after another
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
        }
      } else if (selector.includes('abcd')) {
        for (const color of this.colors) {
          colorsUsed.push(color); // Resets colors to be one after another
        }
      } else if (selector.includes('aabccd')) {
        for (let i = 0; i < this.colors.length; i += 2) {
          colorsUsed.push(this.colors[i]);
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
        }
      } else if (selector.includes('abbcdd')) {
        for (let i = 0; i < this.colors.length; i += 2) {
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
        }
      } else if (this.colors.length > 2 && selector.includes('abcb')) {
        for (let i = 0; i < this.colors.length; i += 3) {
          colorsUsed.push(this.colors[i]);
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
          colorsUsed.push((!!(this.colors[i + 2]) ? this.colors[i + 2] : this.colors[i - 2]));
          colorsUsed.push((!!(this.colors[i + 1]) ? this.colors[i + 1] : this.colors[i - 1]));
        }
      } else if (selector.includes('random')) {
        let choice = this.colorPatterns[Math.floor(Math.random() * this.colorPatterns.length)]

        for (let i = 0; i < this.colors.length; (selector.includes('abcb') ? i += 3 : (i += 2))) {
          colorsUsed = this.colorSelection(choice);
        }
      } else if (selector.includes('totalRandom')) {
        for (let i = 0; i < this.colors.length; i++) {
          colorsUsed.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
        }
      } else { // Sets to default color scheme if none are selected abcd...
        for (const color of this.colors) {
          colorsUsed.push(color);
        }
      }
    } else { // Sets to default color scheme if the length of colors is less than what is needed to make a pattern.
      for (const color of this.colors) {
        colorsUsed.push(color);
      }
    }
    return colorsUsed; // Returns an array of Colors to be used.
  }

  changeOrientation() {
    let dial = document.getElementById('dial').style; // Gets the Dial
    let dialImg = document.getElementById('dial').getElementsByTagName('img')[0].style; // Gets the Dial
    if (this.wheelRotation.dialLocation === 0) { // Sets the dial location for the first position 000 00X 000
      dial.top = this.settingInputs.wheelSize / 2 + this.settingInputs.dialSize * 3 / 4 + 'px';
      dial.marginLeft = (this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 4) + 'px';
    } else if (this.wheelRotation.dialLocation === 45) { // Sets the dial location for the second position 000 000 00X
      dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize + 16 + 'px';
      dial.marginLeft = ((this.settingInputs.wheelSize / 2) - this.settingInputs.dialSize * 2) + 'px';
    } else if (this.wheelRotation.dialLocation === 90) { // Sets the dial location for the third position 000 000 0X0
      dial.top = this.settingInputs.wheelSize + this.settingInputs.dialSize + 'px';
      dial.marginLeft = this.settingInputs.dialSize / 2 + 'px';
    } else if (this.wheelRotation.dialLocation === 135) { // Sets the dial location for the fourth position 000 000 X00
      dial.top = (this.settingInputs.wheelSize) * 3 / 4 + this.settingInputs.dialSize + 16 + 'px';
      dial.marginLeft = '-' + ((this.settingInputs.wheelSize / 2) - this.settingInputs.dialSize) + 'px';
    } else if (this.wheelRotation.dialLocation === 180) { // Sets the dial location for the fifth position 000 X00 000
      dial.top = this.settingInputs.wheelSize / 2 + this.settingInputs.dialSize * 7 / 4 + 'px';
      dial.marginLeft = -1 * (this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 4) + 'px';
    } else if (this.wheelRotation.dialLocation === 225) { // Sets the dial location for the sixth position X00 000 000
      dial.top = (this.settingInputs.wheelSize) * 1 / 4 - this.settingInputs.dialSize + 16 + 'px';
      dial.marginLeft = '-' + ((this.settingInputs.wheelSize / 2) - this.settingInputs.dialSize) + 'px';
    } else if (this.wheelRotation.dialLocation === 270) { // Sets the dial location for the seventh position 0X0 000 000
      dial.top = this.settingInputs.dialSize + this.settingInputs.dialSize / 2 + 'px';
      dial.marginLeft = -1 * this.settingInputs.dialSize / 2 + 'px';
    } else if (this.wheelRotation.dialLocation === 315) { // Sets the dial location for the eigth position 00X 000 000
      dial.top = (this.settingInputs.wheelSize) / (Math.PI * 2) + this.settingInputs.dialSize + 'px';
      dial.marginLeft = (this.settingInputs.wheelSize / Math.PI) - 5 + 'px';
    }
    dial.transform = 'rotate(' + this.wheelRotation.dialLocation + 'deg)'; // Rotates the dial to whatever is selected as the location

  }

  changeTab(tab, i) {
    // Sets all variables to document Items
    let btnAr = document.getElementsByClassName('tabButtons').item(0),
      tabAr = [document.getElementById('contestantsTab'), document.getElementById('colorsTab'), document.getElementById('settingsTab')];

    for (let x = 0; x < btnAr.children.length; x++) { // Resets the current active tab
      btnAr.children.item(x).className = '';
      tabAr.forEach((child) => child.className = 'disabled');
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
  drawSegmentLabel(canvas, context, i, cenX, cenY) {
    context.save(); // Saves the context
    context.translate(cenX, cenY); // Moves context to the center of the circle
    context.rotate(this.contestants[i].sAngle); // Rotates the context to the angle at which the contestants angle starts
    const dx = Math.floor(canvas.width * 0.5) - 10; // Starts the
    const dy = Math.floor(canvas.height * 0.05) - 10; //

    context.textAlign = 'right'; // Alighs the text to the right
    const fontSize = Math.floor(canvas.height / 30); // Determines that size of the font  ***** Will be changed
    context.font = fontSize + 'pt Helvetica'; // Picks the font and size of the segment label

    context.fillText(this.contestants[i].name, dx, dy);

    context.restore();
  }

  // Draws each individual segment of the Wheel
  drawSegment(canvas, context, angleSpacing, i) {
    context.save(); // Saves the context of the canvas
    const cenX = Math.floor(canvas.width / 2), // Finds the center of the canvas' width
      cenY = Math.floor(canvas.height / 2), // Finds the center of the canvas' height
      rad = Math.floor(canvas.width / 2), // Finds the radius of the circle, using the canvas width
      arcSize = this.degToRad(angleSpacing); // Turns the degrees to Radians of the angle spacing to get the size of the arc on the circle
    this.contestants[i].sAngle = this.degToRad(angleSpacing * i), // Gives the point at which the arc will be drawn in Radians
      this.contestants[i].eAngle = this.contestants[i].sAngle + arcSize; // Finds the end point at which the slice can be drawn

    context.beginPath(); // Starts the path
    context.moveTo(cenX, cenY); // Moves to the center
    context.arc(cenX, cenY, rad, this.contestants[i].sAngle, this.contestants[i].eAngle, false); // Makes an arc
    context.closePath(); // Ends the path
    context.lineWidth = 5
    if (!!(this.settingInputs.customImage)) {
      context.strokeStyle = 'gray';
      context.stroke()
    } else {
      context.fillStyle = this.contestants[i].sColor; // Finds the color of the slice
      context.fill(); // Fills the color
    }
    context.restore(); // This method restores the most recently saved canvas state by popping the top entry in the drawing state stack

    this.drawSegmentLabel(canvas, context, i, cenX, cenY); // Calls the function draw Segment Label,
  }

  // Refreshes the Wheel
  refreshWheel() {
    const angleSpacing = 360 / this.contestants.length; // Creates the variable angleSpacing which represents the amount angle that each contestant will take up on the circle
    this.resetColors(); // Calls the function reset Colors
    this.setPageColors();
    for (let i = 0; i < this.contestants.length; i++) {
      this.drawSegment(this.canvas, this.ctx, angleSpacing, i);
    }
  }

  // Removes the Selected Contestant
  removeSelectedContestant(name) {
    const removee = this.contestants.find((contestant) => contestant.name === name); // Finds the Removee
    this.contestants.splice(this.contestants.indexOf(removee), 1); // Removes the contestant from the list of contestants
    sessionStorage.setItem('contestants', JSON.stringify(this.contestants)); // Saves the Contestants to the User's Session
    // this.contestants = JSON.parse(sessionStorage.getItem('contestants'));
    this.refreshWheel();
  }


  // Removes the Selected Color
  removeSelectedColor(name) {
    this.colors.splice(this.colors.indexOf(name), 1);
    this.resetColors();
    sessionStorage.setItem('colors', JSON.stringify(this.colors));
    // this.colors = JSON.parse(localStorage.getItem('colors'));
    this.refreshWheel();
  }

  // Resets the Colors
  resetColors() {
    let colorsUsed = this.colorSelection(this.colorSelector);

    this.contestants.forEach((contestant) => {
      if (!!(contestant.cColor)) { // Checks to see if the contestant has their own Color Field
        contestant.sColor = contestant.cColor; // Sets it to that Color Field
      } else {
        if (colorsUsed.length === 0) { // Checks to see if the array is empty
          colorsUsed = this.colorSelection(this.colorSelector); // Resets the Array
        }
        contestant.sColor = colorsUsed.splice(0, 1); // Removes 1 color at a time from colorsUsed and sets it to the contestants Slice Color
      }

    });
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
      let x2 = Math.floor(Math.random() * this.dialOrientation.length);
      let y2 = Math.floor(Math.random() * this.dialOrientation.length);
      this.setDialOrientation(x2, y2, this.dialOrientation[x2, y2]);
    } else {
      let dialLocationValues = [[225, 270, 315], [180, null, 0], [135, 90, 45]];
      this.wheelRotation.dialLocation = dialLocationValues[x][y];
      for (let i = 0; i < this.dialOrientation.length; i++) {
        for (let j = 0; j < this.dialOrientation[i].length; j++) {
          if (!this.dialOrientation[i][j].includes('R'))
            this.dialOrientation[i][j] = 'O'
        }
      }
      this.dialOrientation[x][y] = 'X'
      this.changeOrientation();
    }

  }

  setDialSize() {
    let dial = document.getElementById('dial').style;
    dial.width = this.settingInputs.dialSize;
    dial.height = this.settingInputs.dialSize;
    this.changeOrientation();
  }

  setPageColors() {
    document.body.style.backgroundColor = this.settingInputs.bgColor; // Sets the Background Color
    document.getElementById('contestantsTab').style.backgroundColor = this.settingInputs.acColor; // Set the Contestants Tab's Color
    document.getElementById('contestantsTab').style.color = this.settingInputs.fontColor; // Set the Contestants Tab's Font Color
    document.getElementById('contestantsTabTable').style.backgroundColor = this.colorLum(this.settingInputs.acColor, 0.2); // Sets the Contestants Tab Color to be 20% lighter
    document.getElementById('contestantsTabTable').style.color = this.settingInputs.fontColor; // Sets the Contestants Tab Color to be 20% lighter
    document.getElementById('colorsTab').style.backgroundColor = this.settingInputs.acColor; // Sets the colors tab's color
    document.getElementById('colorsTab').style.color = this.settingInputs.fontColor; // Sets the colors tab's color
    document.getElementById('colorsTabTable').style.backgroundColor = this.colorLum(this.settingInputs.acColor, 0.2); // Sets the Color's Tab's Table
    document.getElementById('spinbtn').style.backgroundColor = this.settingInputs.sBColor; // Sets the Color of the Spin Button
    document.getElementById('spinbtn').style.color = this.settingInputs.fontColor; // Sets the font color of the spin button
    document.getElementById('settingsTab').style.backgroundColor = this.settingInputs.acColor; // Sets the Settings Table
    document.getElementById('settingsTab').style.color = this.settingInputs.fontColor; // Sets the Settings Table
    document.getElementById('winnerModal').style.backgroundColor = this.settingInputs.mWColor + 'dd'; // Sets the Wrapper Winner Modal Background
    document.getElementById('winnerModal').getElementsByTagName('div')[0].style.backgroundColor = this.settingInputs.mColor; // Sets the Winner Modal Background
    document.getElementById('winnerModal').style.color = this.settingInputs.mFColor; // Sets the Settings Table
    console.log(document.getElementsByClassName('tabHeader')); // Sets the Settings Table
    for (let doc of document.getElementsByClassName('tabHeader')) {
      doc.style.borderBottom = this.colorLum(this.settingInputs.acColor, 0.2) + '1px dashed';
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
    this.canvas.width = this.settingInputs.wheelSize;
    this.canvas.style.marginLeft = -1 * this.settingInputs.wheelSize / 2 + 'px';
    this.canvas.height = this.settingInputs.wheelSize;
    this.refreshWheel();
    this.changeOrientation();
  }


  // Spin Function
  spinWheel() {
    this.wheelRotation.counter = 0;
    this.wheelRotation.rate = JSON.parse(JSON.stringify(this.settingInputs.spinRate) * 1.238756);
    document.getElementById('spinbtn').classList.add('disabled'); // Adds the field of disabled to the Spin Button
    this.wheelRotation.timer = (100 * this.settingInputs.spinTime); // The total timer, each 10 is a second, each digit increase is a 10 degree turn. 36 = 3.6 seconds and a complete 360 degree rotation if the rate is at 1.
    const intervalId = setInterval(() => this.rotateWheel(intervalId, this.wheelRotation.timer), 1);
  }

  // Testing the Color value to see if it is in the Hex format
  testForHex() {
    if (this.hexTest.test(this.color) || this.hexTest.test(this.color.substring(1))) {
      if (this.color.charAt(0) !== '#') {
        this.color = '#' + this.color;
      }
      return false;
    }
    return true;
  }
}
