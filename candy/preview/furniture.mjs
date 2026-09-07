// Small local SVG toys; no image service or font dependency.
const wood='#bd946e',light='#ead1aa',pink='#dca8ba',cream='#fff1da';
const rect=(x,y,w,h,fill,r=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const star=`<path d="M50 12 58 36 84 36 63 51 71 76 50 61 29 76 37 51 16 36 42 36Z" fill="#e5c17f"/>`;
export function furnitureIcon(type){let body='';
 if(type===0)body=rect(8,32,12,57,wood)+rect(18,49,72,34,pink)+rect(21,40,25,17,cream,8)+rect(81,60,10,30,wood)+rect(20,78,65,7,light);
 if(type===1)body=rect(12,35,76,47,pink,15)+rect(20,45,60,22,'#edc4cf',9)+rect(7,55,17,29,pink,8)+rect(76,55,17,29,pink,8)+rect(20,82,8,10,wood)+rect(72,82,8,10,wood);
 if(type===2)body=rect(26,17,49,48,wood,10)+rect(31,23,39,29,light)+rect(20,57,61,14,pink)+rect(25,67,8,26,wood)+rect(67,67,8,26,wood);
 if(type===3)body=circle(30,23,12,wood)+circle(70,23,12,wood)+circle(50,41,26,wood)+circle(50,72,24,wood)+circle(23,69,12,wood)+circle(77,69,12,wood)+circle(34,89,10,wood)+circle(66,89,10,wood)+circle(50,75,14,light)+circle(40,39,3,'#655044')+circle(60,39,3,'#655044')+circle(50,48,4,'#655044');
 if(type===4)body=`<path d="M17 82Q50 98 86 80" fill="none" stroke="${wood}" stroke-width="7"/>`+rect(28,55,9,29,wood)+rect(67,55,9,29,wood)+`<ellipse cx="48" cy="53" rx="29" ry="18" fill="${cream}"/>`+rect(64,19,19,43,cream,9)+circle(78,26,14,cream)+circle(84,23,2,'#665349')+rect(65,20,7,35,pink)+rect(38,41,24,19,pink);
 if(type===5)body=rect(44,60,12,30,wood)+rect(24,87,52,6,wood)+`<ellipse cx="50" cy="37" rx="29" ry="34" fill="${wood}"/><ellipse cx="50" cy="37" rx="24" ry="29" fill="#c2dce0"/><path d="M37 48 60 20M45 57 68 28" stroke="#fff6e6" stroke-width="4"/>`;
 if(type===6)body=rect(9,15,82,67,wood)+rect(15,21,70,55,'#c9dbcd')+circle(65,36,10,'#f1d393')+`<path d="M15 72 40 40 64 76 80 53 85 76H15Z" fill="#a0b99b"/>`;
 if(type===7)body=rect(34,57,33,33,wood,8)+`<path d="M50 60V20" stroke="#97b290" stroke-width="5"/><ellipse cx="37" cy="35" rx="17" ry="9" fill="#abc49c" transform="rotate(30 37 35)"/><ellipse cx="64" cy="22" rx="17" ry="10" fill="#8caf91" transform="rotate(-30 64 22)"/>`;
 if(type===8)body=rect(10,26,80,50,wood)+rect(17,34,66,21,'#96745b')+rect(15,62,70,14,cream)+[25,35,55,65,75].map(x=>rect(x,62,4,9,'#756350',0)).join('')+rect(17,76,8,17,wood)+rect(75,76,8,17,wood);
 if(type===9)body=[['#a3bbb5',17,18],['#d5a5b8',35,25],['#dfbe80',53,13],['#baa6c6',71,30]].map(([col,x,y])=>rect(x,y,15,76-y,col,2)+rect(x+3,y+8,9,3,cream)).join('')+rect(12,77,79,7,wood);
 if(type===10)body=star+rect(47,76,6,15,wood)+rect(30,89,40,5,wood);
 if(type===11)body=['#d9a2b5','#e6c18a','#afc49d','#a8c8ce','#b9a8d0'].map((col,i)=>`<path d="M${10+i*7} 79A${40-i*7} ${40-i*7} 0 0 1 ${90-i*7} 79" fill="none" stroke="${col}" stroke-width="7"/>`).join('');
 if(type===12)body=[[30,30,20],[68,55,22],[32,77,12]].map(([x,y,r])=>circle(x,y,r,'#bad6df')+circle(x-5,y-6,r/3,'#f2f1e1')).join('');
 if(type===13)body=rect(46,62,8,26,wood)+rect(23,86,54,7,wood)+`<path d="M20 58 16 21 36 39 50 12 65 39 84 21 80 58Z" fill="#e5c17f"/>`+circle(50,42,6,pink);
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`);
}
