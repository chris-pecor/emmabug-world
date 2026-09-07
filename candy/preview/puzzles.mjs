const PUZZLES={meadow:{a:2,b:1,op:'+'},berry:{a:4,b:1,op:'−'},river:{a:3,b:2,op:'+'},peaks:{a:2,b:4,op:'+'}};
export function puzzleFor(levelId){const puzzle=PUZZLES[levelId]||PUZZLES.meadow;
 const answer=puzzle.op==='+'?puzzle.a+puzzle.b:puzzle.a-puzzle.b;
 return {...puzzle,answer,choices:[answer+1,answer-1,answer]};
}
