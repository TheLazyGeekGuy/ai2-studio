/** Documented 8-byte algorithm parameter blocks. X5DR OM note 11-3; NS5R Table 3. */
export interface Ai2EffectField {id:number;offset:number;label:string;group:string;min:number;max:number;width?:number;mask?:number;shift?:number;options?:readonly string[]}
export const ai2EffectNames=['Off','Hall 1','Hall 2','Hall 3','Room 1','Room 2','Live stage','Wet plate','Dry plate','Spring','Early reflection 1','Early reflection 2','Early reflection 3','Stereo delay','Cross delay','Dual delay','Multi tap delay 1','Multi tap delay 2','Multi tap delay 3','Stereo chorus 1','Stereo chorus 2','Quadrature chorus','Crossover chorus','Harmonic chorus','Symphonic ensemble','Flanger 1','Flanger 2','Crossover flanger','Exciter','Enhancer','Distortion','Overdrive','Phaser 1','Phaser 2','Rotary speaker','Auto pan','Tremolo','Parametric EQ','Chorus / delay','Flanger / delay','Delay / hall','Delay / room','Delay / chorus','Delay / flanger','Delay / distortion','Delay / overdrive','Delay / phaser','Delay / rotary speaker']
export function ai2EffectParameters(types:readonly number[],bases:readonly number[]):Ai2EffectField[]{
 const out:Ai2EffectField[]=[]
 for(let fx=0;fx<2;fx++){
 const type=types[fx]&127,group='FX '+(fx+1),base=bases[fx]
 const add=(n:number,label:string,min=0,max=99,width=1)=>out.push({id:20000+fx*100+n,offset:base+n,label,group,min,max,width})
 const eq=()=>{add(6,'EQ high',-12,12);add(7,'EQ low',-12,12)}
 const flag=(n:number,bit:number,label:string,options:readonly string[])=>out.push({id:21000+fx*100+n*8+bit,offset:base+n,label,group,min:0,max:1,mask:1<<bit,shift:bit,options})
 if(type>=1&&type<=6){add(0,'Reverb time',0,type<=3?61:47);add(2,'High damp');add(3,'Pre-delay',0,200);add(4,'Early reflection level');eq()}
 else if(type>=7&&type<=9){add(0,'Pre-delay',0,200,2);add(2,'Early reflection level',1,10);add(3,'Reverb time');add(4,'High damp');eq()}
 else if(type>=10&&type<=12){add(0,'Early reflection time',0,70);add(1,'Pre-delay',0,200);eq()}
 else if(type===13||type===14){add(0,'Delay left',0,500,2);add(2,'Feedback',-99,99);add(3,'High damp');add(4,'Delay right',0,500,2);eq()}
 else if(type===15){add(0,'Delay left',0,500,2);add(2,'Feedback left',-99,99);add(3,'High damp left');add(4,'Delay right',0,500,2);add(6,'Feedback right',-99,99);add(7,'High damp right')}
 else if(type>=16&&type<=18){add(0,'Tap 1 delay',0,500,2);add(2,'Tap 2 delay',0,500,2);add(4,'Feedback',-99,99);eq()}
 else if(type===19||type===20){add(0,'Mod depth');add(1,'Mod speed',0,216);add(3,'Delay time',0,200);eq()}
 else if(type===21||type===22){add(0,'Delay left',0,250);add(1,'Delay right',0,250);add(2,'Mod speed',1,99);add(3,'Mod depth');add(4,'Mod waveform',-21,20);add(5,'EQ low',-12,12);add(6,'EQ high',-12,12)}
 else if(type===23){add(0,'Delay left',0,500,2);add(2,'Delay right',0,500,2);add(4,'Mod speed',1,99);add(5,'Mod depth');add(6,'EQ split point',0,12)}
 else if(type===24){add(0,'Mod depth');add(1,'Mod speed',0,216);eq()}
 else if(type>=25&&type<=27){add(0,'Delay time',0,200);add(1,'Mod depth');add(2,'Mod speed',1,99);add(3,'Resonance',-99,99);eq()}
 else if(type===28){add(0,'Blend',-99,99);add(1,'Emphatic point',1,10);eq()}
 else if(type===29){add(0,'Harmonic density',1,99);add(1,'Hot spot',1,20);add(2,'Stereo width');add(3,'Delay',1,99);eq()}
 else if(type===30||type===31){add(0,'Drive',1,111);add(1,'Hot spot');add(2,'Resonance');add(3,'Output level');eq()}
 else if(type===32||type===33){add(0,'Mod depth',1,99);add(1,'Mod speed',0,216);add(3,'Feedback',-99,99);add(4,'Manual')}
 else if(type===34){add(0,'Vibrato depth',0,15);add(1,'Acceleration',1,15);add(2,'Slow speed',1,99);add(3,'Fast speed',1,99)}
 else if(type===35||type===36){add(0,'Depth');add(1,'Speed',0,216);add(3,'Shape',-99,99);eq()}
 else if(type===37){add(0,'Low frequency',0,29);add(1,'Low gain',-12,12);add(2,'Mid frequency');add(3,'Mid gain',-12,12);add(4,'Mid width');add(5,'High frequency',0,29);add(6,'High gain',-12,12)}
 else if(type===38||type===39){add(0,'Delay 1',0,50);add(1,'Mod speed',1,99);add(2,'Mod depth');add(3,'Feedback 1',-99,99);add(4,'Delay 2',0,450,2);add(6,'Feedback 2',-99,99)}
 else if(type>=40&&type<=47){add(0,'Delay time',0,500,2);add(2,'Feedback',-99,99);add(3,type===40||type===41?'High damp':type>=44&&type<=45?'Drive':type===47?'Acceleration':'Depth',type>=44&&type<=45||type===47?1:0,type>=44&&type<=45?111:type===47?15:99);
 if(type===40||type===41){add(4,'Reverb time',0,type===40?61:47);add(6,'High damp');add(7,'Pre-delay',0,150)}
 else if(type===42||type===43){add(4,'Depth');add(5,'Speed',0,216);add(7,'Feedback',-99,99)}
 else if(type===44||type===45){add(4,'Hot spot');add(5,'Resonance');add(6,'Output level',1,99)}
 else if(type===46){add(4,'Depth');add(5,'Speed',0,216);add(6,'Feedback',-99,99)}
 else {add(4,'Slow speed',1,99);add(5,'Fast speed',1,99)}}
 if(type===48){add(0,'Trim');add(1,'Feedback');add(2,'Cutoff');add(3,'EG intensity',-99,99);add(4,'Attack',0,127);add(5,'Decay',0,127);add(6,'Trigger type',0,2);add(7,'LFO intensity',0,127)}
 if([19,20,24,32,33,35,36].includes(type))flag(2,0,'Mod waveform',['Sine','Triangle'])
 if([19,20,24].includes(type))flag(2,1,'Mod phase',['0°','180°'])
 if([42,43].includes(type))flag(6,0,'Mod waveform',['Sine','Triangle'])
 }
 return out
}
