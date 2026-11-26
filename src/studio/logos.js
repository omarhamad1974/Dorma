/* Logo defaults (Design → Logo), kept free of imports so data.js and core.js can both use them. */
export const SILVER_PRESETS={
  classic:["#868b92","#f4f5f7","#a4a9b0","#e6e8eb","#767b82"],
  bright:["#bfc5cc","#ffffff","#d5d9de","#f6f7f9","#adb3ba"],
  steel:["#4b5159","#c8cdd4","#69707a","#a9afb7","#3d434a"]
};
export const LOGO_DEFAULTS={ white:"", colour:"", versions:[],
  silver:{ from:"white", preset:"classic", angle:115, dark:"#7b8087", light:"#f4f5f7", shine:"none", shineTime:4 },
  places:{ header:{dark:"auto",light:"auto",hero:"auto",height:34,phone:0}, menu:{dark:"auto",light:"auto",height:38,phone:0},
    footer:{show:false,dark:"auto",light:"auto",height:28,phone:0}, loader:{dark:"auto",light:"auto",width:238,phone:0} } };
