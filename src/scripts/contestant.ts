import * as cuid from 'cuid';

export interface Contestant {
  id: string,
  name: string,
  sAngle: number,
  eAngle: number,
  sColor: string
}
let contestants: Contestant[];
export function createContestants(arr?: Contestant[]) {
  contestants = (arr) ? arr : [{id: cuid(), name: 'Jonny', sAngle: 0, eAngle: 0, sColor: '#FFDAB9'},
    {id: cuid(), name: 'Tom', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
    {id: cuid(), name: 'Trish', sAngle: 0, eAngle: 0, sColor: '#E6E6FA'},
    {id: cuid(), name: 'NoobMaster69', sAngle: 0, eAngle: 0, sColor: '#7744ff'}];
  return contestants;
}

export function addContestant(name: string, callback?: () => void) {
  validateContestant(name);
  contestants.push({id: cuid(), name, sAngle: 0, eAngle: 0, sColor: ''});
  callback();
}
export function clearContestants(callback?: () => void) {
  contestants.splice(0, contestants.length);
  callback();
  sessionStorage.setItem('contestants', JSON.stringify(contestants));
}
export function removeContestant(id: string, callback?: () => void) {
  const removee = contestants.find((contestant) => contestant.id === id); // Finds the Removee
  contestants.splice(contestants.indexOf(removee), 1); // Removes the contestant from the list of contestants
  sessionStorage.setItem('contestants', JSON.stringify(contestants)); // Saves the Contestants to the User's Session
  callback();
}

function validateContestant(str: string) {
  if (str.trim() === '') {
    throw Error('Could not add Contestant, lacking a name');
  }
}
