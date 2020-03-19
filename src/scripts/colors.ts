import {Contestant} from "./contestant";

interface SelectedColor {
  id: string;
  color: string;
}

export let colorPatterns: string[] = ['abcd', 'ababcdcd', 'aabccd', 'abbcdd', 'abababcdcdcd', 'random', 'totalRandom'];

let colors: string[];

export function createColors(arr?: string[]) {
  colors = (arr) ? arr : ['#FFDAB9', '#E6E6FA', '#7744ff'];
  return colors;
}


// Selects the color based on what the current pattern selected is
export function colorSelection(selector: string) {
  let colorsUsed: string[] = [];
  if (colors.length > 1) { // Checks to make sure that there is more than 1 color
    switch (selector) { // Creates the pattern shown by adding to itself the color mutliple times.
      case 'abababcdcdcd':
        for (let i = 0; i < colors.length; i += 2) { // Moves 2 at a time so it loops through two colors from ab to cd
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
        }
        break;
      case 'ababcdcd':
        for (let i = 0; i < colors.length; i += 2) {
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
        }
        break;
      case 'aabccd':
        for (let i = 0; i < colors.length; i += 2) {
          colorsUsed.push(colors[i]);
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
        }
        break;
      case 'abbcdd':
        for (let i = 0; i < colors.length; i += 2) {
          colorsUsed.push(colors[i]);
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
          colorsUsed.push((!!(colors[i + 1]) ? colors[i + 1] : colors[i - 1]));
        }
        break;
      case 'random':
        let choice = colorPatterns[Math.floor(Math.random() * colorPatterns.length)];
        for (let i = 0; i < colors.length; (i += 2)) {
          colorsUsed = colorSelection(choice);
        }
        break;
      case 'totalRandom':
        for (let i = 0; i < colors.length; i++) {
          colorsUsed.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        break;
      default: // Sets to default color scheme if none are selected abcd...
        for (const color of colors) {
          colorsUsed.push(color);
        }
        break;
    }
  } else { // Sets to default color scheme if the length of colors is less than what is needed to make a pattern.
    for (const color of colors) {
      colorsUsed.push(color);
    }
  }
  return colorsUsed; // Returns an array of Colors to be used.
}

// Resets the Colors
export function resetColors(Contestants: Contestant[], Selector: string, selectedColors?: SelectedColor[]) {
  let colorsUsed = colorSelection(Selector);
  Contestants.forEach((contestant) => {
    if (selectedColors && selectedColors.find(sC => contestant.id === sC.id)) { // Checks to see if the contestant has their own Color Field
      contestant.sColor = selectedColors.find(sC => contestant.id === sC.id).color; // Sets it to that Color Field
    } else {
      if (colorsUsed.length === 0) { // Checks to see if the array is empty
        colorsUsed = colorSelection(Selector); // Resets the Array
      }
      contestant.sColor = colorsUsed.splice(0, 1)[0]; // Removes 1 color at a time from colorsUsed and sets it to the contestants Slice Color
    }
  });
}


export function addColor(Color: string, callback?: () => void) {
  validateColor(Color);
  colors.push(Color);
  sessionStorage.setItem('colors', JSON.stringify(colors));
  callback();
}
export function removeColor(Color: string, callback?: () => void) {
  colors.splice(colors.indexOf(Color), 1);
  sessionStorage.setItem('colors', JSON.stringify(colors));
  callback();
}

function validateColor(str: string) {
  if (str.trim() === '') {
    throw Error('Could Not Add Color, Please Enter a Color');
  } else if (str.substring(0, 1) !== '#') {
    throw Error('Could Not Add Color Not in Hex Format');
  } else if (str.length === 69) {
    throw Error('Nice');
  } else if (str.length === 7 || str.length === 9) {
    throw Error('Color Not the Proper Length');
  }
}
