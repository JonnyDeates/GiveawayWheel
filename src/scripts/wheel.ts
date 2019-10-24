export function changeDialOrientation(WheelSize, DialSize, topMargin, dialLocation, callback?) {
  let dial = {top: '', marginLeft: ''};
  callback();
  switch (dialLocation) {
    case 45: // Sets the dial location for the second position 000 000 00X
      dial.top = (WheelSize) * 3 / 4 + DialSize + topMargin + 'px';
      dial.marginLeft = (WheelSize / 4) + DialSize * 1.5 + 8 + 'px';
      return dial;
    case 90: // Sets the dial location for the third position 000 000 0X0
      dial.top = WheelSize + DialSize + 'px';
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
      dial.marginLeft = -1 * ((this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + this.settingInputs.dialSize / 2 + 8) + 'px';
      return dial;
    case 270: // Sets the dial location for the seventh position 0X0 000 000
      dial.top = -16 + this.settingInputs.dialSize / 2 + topMargin + 'px';
      dial.marginLeft = -1 * this.settingInputs.dialSize / 2 + 'px';
      return dial;
    case 315: // Sets the dial location for the eigth position 00X 000 000
      dial.top = -8 + this.settingInputs.wheelSize / 4 - this.settingInputs.dialSize * 1.5 + topMargin + 'px';
      dial.marginLeft = (this.settingInputs.wheelSize / 4) + this.settingInputs.dialSize + 'px';
      break;
    default: // Sets the dial location for the first position 000 00X 000
      dial.top = topMargin + this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 2 + 'px';
      dial.marginLeft = (this.settingInputs.wheelSize / 2 - this.settingInputs.dialSize / 4) + 'px';
      return dial;
  }
}
