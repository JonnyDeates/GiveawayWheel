export interface Settings {
  bgColor: string,
  sBColor: string,
  acColor: string,
  mColor: string,
  mFColor: string,
  mWColor: string,
  fontColor: string,
  customImage: string,
  wheelSize: number,
  fontSize: number,
  spinTime: number,
  spinRate: number,
  dialSize: number
}

export let dialOrientation: string[][] = [['O', 'O', 'O'], ['O', 'R', 'X'], ['O', 'O', 'O']];
let settings: Settings;

export function createSettings(arr?: Settings) {
  settings = (arr) ? arr : {
    bgColor: '#00b140',
    sBColor: '#c3ecf8',
    acColor: '#ffffff',
    mColor: '#ffffff',
    mFColor: '#000000',
    mWColor: '#000000dd',
    fontColor: '#000000',
    customImage: null,
    wheelSize: 720,
    dialSize: 50,
    fontSize: 48,
    spinTime: 5,
    spinRate: 1.1
  };
  return settings;
}
