
// Converts from Degrees to Radians
export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Get Random Value between two Values
export function getRBwVal(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Get Random Int between two Values
export function getRInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // Min is inclusive, Max is Exclusive
}

// Recieved from https://www.sitepoint.com/javascript-generate-lighter-darker-color/, allows for easy changing of hex format to be increase or decreased based on a percent value
export function colorLum(hex: string, lum: number) {
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
