interface Scoreboard {
  contestants: string[];
}

let scoreboard: string[];

export function createScoreboard(arr?: string[]) {
  scoreboard = (arr) ? arr : ['Jonny', 'Denny', 'Joe'];
  return scoreboard;
}

// Resets the Colors
export function resetScoreBoard() {
  for (const x of scoreboard) {
    scoreboard.pop();
  }
}


export function addScoreboardContestant(Name: string, callback?: () => void) {
  if (scoreboard.length >= 15) {
    scoreboard.pop();
  }
  scoreboard.splice(0, 0, Name);
  console.log(scoreboard, 'herererer ')
  sessionStorage.setItem('scoreboard', JSON.stringify(scoreboard));
  callback();
}

export function removeScoreboardContestant(Name: string, callback?: () => void) {
  scoreboard.splice(Name.indexOf(Name), 1);
  sessionStorage.setItem('scoreboard', JSON.stringify(scoreboard));
  callback();
}
