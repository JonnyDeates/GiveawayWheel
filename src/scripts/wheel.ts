
export let dialOrientation: string[][] = [['O', 'O', 'O'], ['O', 'R', 'X'], ['O', 'O', 'O']];

export function changeDialOrientation(WheelSize, DialSize, topMargin, dialLocation) {
  // Changes the Dials Orientation
  const dial = {top: '', marginLeft: ''};
  switch (dialLocation) {
    case 45: // Sets the dial location for the second position 000 000 00X
      dial.top = (WheelSize) * 3 / 4 + DialSize + topMargin + 'px';
      dial.marginLeft = (WheelSize / 4) + DialSize * 1.5 + 8 + 'px';
      return dial;
    case 90: // Sets the dial location for the third position 000 000 0X0
      dial.top = WheelSize - .5 * DialSize + topMargin + 'px';
      dial.marginLeft = DialSize / 2 + 'px';
      return dial;
    case 135: // Sets the dial location for the fourth position 000 000 X00
      dial.top = (WheelSize) * 3 / 4 + DialSize * 1.5 + topMargin + 'px';
      dial.marginLeft = -1 * ((WheelSize / 4) + DialSize / 2 + 8) + 'px';
      return dial;
    case 180: // Sets the dial location for the fifth position 000 X00 000
      dial.top = WheelSize / 2 + DialSize / 2 + topMargin + 'px';
      dial.marginLeft = -1 * (WheelSize / 2 - DialSize / 4) + 'px';
      return dial;
    case 225: // Sets the dial location for the sixth position X00 000 000
      dial.top = WheelSize / 4 - DialSize + topMargin + 'px';
      dial.marginLeft = -1 * ((WheelSize / 4) + DialSize + DialSize / 2 + 8) + 'px';
      return dial;
    case 270: // Sets the dial location for the seventh position 0X0 000 000
      dial.top =  DialSize / 2 + topMargin + 'px';
      dial.marginLeft = -1 * DialSize / 2 + 'px';
      return dial;
    case 315: // Sets the dial location for the eighth position 00X 000 000
      dial.top =  (WheelSize * Math.sqrt(2) - WheelSize) / 2 - DialSize  + topMargin + 'px';
      dial.marginLeft = (WheelSize * Math.sqrt(2) - WheelSize) / 2 + DialSize + 'px';
      return dial;
    default: // Sets the dial location for the first position 000 00X 000
      dial.top = topMargin + WheelSize / 2 - DialSize / 2 + 'px';
      dial.marginLeft = (WheelSize / 2 - DialSize / 2) + 'px';
      return dial;
  }
}
