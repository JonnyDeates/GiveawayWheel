export interface Settings {
  colors: {
    background: string,
    accent: string,
    spinBtn: string,
    font: string,
    modal: string,
    modalBackground: string,
    modalFont: string
  },
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
    colors: {
      background: '#00b140',
      accent: '#ffffff',
      spinBtn: '#ffffff',
      font: '#000000',
      modal: '#ffffff',
      modalBackground: '#000000dd',
      modalFont: '#000000'
    },
    customImage: null,
    wheelSize: 720,
    dialSize: 50,
    fontSize: 48,
    spinTime: 5,
    spinRate: 1.1
  };
  return settings;
}
