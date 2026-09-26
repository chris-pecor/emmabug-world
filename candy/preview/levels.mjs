const meadowTheme={sky:['#fbf5e9','#f7eedb','#e6e7c5'],far:['#e4e6ca','#dce1c0'],near:['#cfdbb8','#c4d3ad'],front:['#c4ceaa','#b6c39b'],water:'#b9d4c6',dough:['#dcb77e','#cfa772','#bba17a'],icing:'#fff3dd'};
export const LEVELS=[
 {id:'meadow',name:'Candy Meadow',subtitle:'Follow the sweets. Find a little magic.',symbol:'✿',accent:'#ba8b9b',finish:4210,theme:meadowTheme,
  grounds:[[-300,1280],[1190,530],[2040,790],[2980,1600]],
  floats:[[565,515,155],[720,415,150],[950,495,180],[1480,490,170],[1760,485,190,110],[2290,470,165],[2500,370,170],[2720,480,170],[3230,505,155],[3410,415,175],[3640,525,160]],
  springs:[2180,3050],grumps:[830,1610,2660,3480],stars:[[795,345],[2580,300],[3500,345]],friends:[500,1420,3940],chests:[1340,3830],
  landmarks:['The candy trail','Across the icing islands','A little gumdrop bounce','Among the wishing stars','The celebration castle']},
 {id:'berry',name:'Berry Starlight',subtitle:'Tiny lanterns. Big wishes.',symbol:'☾',accent:'#9880b7',finish:4520,
  theme:{...meadowTheme,night:true,sky:['#fbf1ee','#d6c9e6','#a5b2cd'],far:['#d0c7df','#c2bfd8'],near:['#b3b1d2','#a5b1c9'],front:['#a6b4bd','#98a9b3'],water:'#a8c8d7',dough:['#cfadc2','#bd98b0','#ad8fa5'],icing:'#f8e6ed'},
  grounds:[[-300,1240],[1130,620],[1970,860],[3030,1810]],
  floats:[[540,515,165],[730,405,160],[915,490,185],[1260,485,175],[1510,395,175],[1710,480,190,75],[2030,510,180],[2260,405,170],[2480,315,175],[2790,485,210],[3100,505,190],[3320,405,170],[3540,320,185],[3800,440,180],[4080,520,190]],
  springs:[2130,3180],grumps:[750,1570,2650,3710],stars:[[810,340],[2560,245],[3620,250]],friends:[450,1430,4200],chests:[1290,4060],
  landmarks:['The moonberry grove','The lantern stepping stones','A midnight wishing tree','Follow the fireflies','The starlight castle']},
 {id:'river',name:'Chocolate River',subtitle:'Biscuit boats and caramel dreams.',symbol:'≈',accent:'#b28b66',finish:4700,
  theme:{...meadowTheme,river:true,sky:['#fcf3e8','#f3dfc4','#dcc4a8'],far:['#e5ceb1','#dcc1a1'],near:['#ceb897','#c4ad8c'],front:['#bbaf8c','#ab9f80'],water:'#ad8167',dough:['#b38b6a','#a17b5e','#987557'],icing:'#f9e2b9'},
  grounds:[[-300,1260],[1280,560],[2150,650],[3100,1930]],
  floats:[[530,515,180],[750,415,175],[940,495,230,65],[1250,495,180],[1500,390,180],[1790,490,250,75],[2140,510,180],[2360,410,180],[2570,325,180],[2780,480,255,60],[3130,510,180],[3350,415,180],[3580,320,185],[3820,420,180],[4080,510,180]],
  springs:[2230,3200],grumps:[800,1650,2640,3670],stars:[[825,345],[2650,255],[3665,250]],friends:[440,1460,4390],chests:[1360,4250],
  landmarks:['The caramel orchard','Hop aboard a biscuit boat','Over the chocolate ripples','The toffee stepping stones','The cocoa castle']},
 {id:'peaks',name:'Rainbow Peaks',subtitle:'A little higher. A little more wonder.',symbol:'✦',accent:'#8d9dbb',finish:4920,
  theme:{...meadowTheme,peaks:true,sky:['#f8f3ef','#e0deec','#b9cfdf'],far:['#d7d8e7','#c9d1e2'],near:['#bdcddd','#aebfd3'],front:['#acbfbc','#9aafa9'],water:'#aecfda',dough:['#c4b2c9','#b39eb9','#a293ae'],icing:'#f8f3f4'},
  grounds:[[-300,1250],[1150,650],[2030,840],[3090,2150]],
  floats:[[530,515,165],[720,415,165],[910,315,170],[1100,485,175],[1340,390,175],[1560,300,180],[1790,480,200,70],[2110,515,180],[2300,410,175],[2480,310,180],[2710,220,190],[2870,470,225],[3160,510,185],[3360,410,180],[3560,310,185],[3790,215,200],[4050,405,185],[4310,510,190]],
  springs:[2190,3230],grumps:[790,1640,2640,3850],stars:[[995,245],[2800,150],[3880,145]],friends:[440,1400,4600],chests:[1260,4470],
  landmarks:['The marshmallow foothills','Up the rainbow stairway','A pocket full of clouds','The highest wishing star','The rainbow castle']}
];
// Extra chapters keep each world's terrain distinct. Coordinates are relative to
// the former castle clearing, so the original opening remains familiar.
const CHAPTERS = {
 meadow: {
  length:3400, grounds:[[0,550],[790,610],[1650,650],[2540,1180]],
  floats:[[260,510,165],[450,405,155],[570,490,190,55],[890,490,160],[1090,390,165],[1300,300,170],[1430,485,210,65],[1720,510,170],[1920,410,165],[2140,315,175],[2320,480,195,55],[2640,500,175],[2850,405,170],[3070,505,180]],
  springs:[940,1770,2700],grumps:[350,1190,2090,2910],
  stars:[[1380,230],[2220,245]],chests:[1030,2810],
  landmarks:['The candy trail','Across the icing islands','The gumdrop garden','The wishing-star treetops','The celebration castle']
 },
 berry: {
  length:3800,grounds:[[0,510],[770,550],[1590,650],[2530,560],[3370,750]],
  floats:[[220,510,160],[400,405,160],[540,485,205,75],[830,500,165],[1020,395,160],[1220,290,170],[1370,480,215,85],[1680,505,175],[1870,400,160],[2070,300,170],[2280,475,225,70],[2600,505,170],[2790,400,165],[2990,300,175],[3130,480,220,65],[3430,500,180]],
  springs:[900,1760,2630],grumps:[310,1120,2070,2830,3580],
  stars:[[1300,220],[3070,230]],chests:[1930,3510],
  landmarks:['The moonberry grove','The lantern stepping stones','The firefly bridges','The moonlit canopy','The starlight castle']
 },
 river: {
  length:4200,grounds:[[0,470],[780,520],[1630,540],[2490,580],[3380,1140]],
  floats:[[210,510,180],[410,410,175],[500,490,245,85],[830,500,180],[1040,390,175],[1300,490,260,95],[1650,510,180],[1860,405,180],[2070,305,185],[2210,485,260,90],[2570,510,180],[2780,405,175],[2990,300,185],[3100,480,265,85],[3440,510,180],[3640,410,180],[3850,315,190]],
  springs:[900,1750,2630,3490],grumps:[270,1110,1960,2860,3820],
  stars:[[2155,235],[3940,245]],chests:[1870,3670],
  landmarks:['The caramel orchard','Hop aboard a biscuit boat','The winding cocoa rapids','The toffee lookout','The cocoa castle']
 },
 peaks: {
  length:4600,grounds:[[0,490],[770,580],[1650,600],[2540,620],[3460,610],[4330,590]],
  floats:[[210,510,165],[400,405,160],[570,480,205,80],[830,500,170],[1030,395,165],[1240,290,170],[1430,480,220,90],[1690,510,170],[1880,405,165],[2070,300,175],[2280,205,185],[2330,480,210,75],[2620,505,175],[2820,400,170],[3020,295,180],[3220,200,190],[3230,480,235,85],[3520,510,175],[3720,405,170],[3920,300,180],[4110,480,220,75],[4380,510,175]],
  springs:[920,1760,2640,3540],grumps:[290,1130,2010,2890,3830],
  stars:[[2365,135],[3310,130]],chests:[1910,3690],
  landmarks:['The marshmallow foothills','Up the rainbow stairway','The cloud island crossing','The double rainbow summit','The rainbow castle']
 }
};
for (const level of LEVELS) {
 const chapter=CHAPTERS[level.id],start=level.finish-300;
 // Replace the old finish clearing with a chain of islands and rest stops.
 const last=level.grounds.at(-1);
 last[1]=start+chapter.grounds[0][1]-last[0];
 level.grounds.push(...chapter.grounds.slice(1).map(([x,w])=>[start+x,w]));
 level.floats.push(...chapter.floats.map(([x,...rest])=>[start+x,...rest]));
 level.springs.push(...chapter.springs.map(x=>start+x));
 level.grumps.push(...chapter.grumps.map(x=>start+x));
 level.chests.push(...chapter.chests.map(x=>start+x));
 level.stars=[level.stars[0],...chapter.stars.map(([x,y])=>[start+x,y])];
 level.finish=start+chapter.length;
 level.friends=[level.friends[0],start+chapter.grounds[2][0]+150,level.finish-180];
 level.landmarks=chapter.landmarks;
}
export const levelById=id=>LEVELS.find(level=>level.id===id)||LEVELS[0];
