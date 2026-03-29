import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-9zK5Qo-C.js";import{a as r,i,r as a,t as o}from"./hooks-cvPh8UoV.js";import{t as s}from"./CombinedHook-cvgksZjk.js";var c,l,u,d,f;t((()=>{c=e(n()),o(),s(),l=e=>{let{canvasWidth:t=320,canvasHeight:n=240,videoWidth:o=640,videoHeight:s=480,zoom:l=1}=e,[u,d]=(0,c.useState)([]),[f,p]=(0,c.useState)([]),m=e=>{d(u.concat(e))},{webcamVideo:h,webcamVideoRef:g,hasPermission:_,trackSettings:v}=a({onDevices:p}),{onDraw:y,canDetect:b,canvas:x,canvasRef:S}=r({hasPermission:_,onScan:m});return i({onDraw:y,webcamVideo:h,trackSettings:v,shouldDraw:b,canvas:x,hasPermission:_,shouldPlay:!0,zoom:l}),c.createElement(`div`,null,_?c.createElement(`div`,{className:`scan-canvas-container`},c.createElement(`div`,{className:`scan-canvas-video`},c.createElement(`video`,{ref:g,width:o,height:s})),c.createElement(`div`,{className:`scan-canvas`},c.createElement(`canvas`,{ref:S,width:t,height:n})),c.createElement(`div`,{className:`scanned-codes`},c.createElement(`textarea`,{rows:10,cols:100,readOnly:!0,value:u.join(`
`)}))):null)},u={component:l,title:`Scanner/Separate Hooks`},d={args:{zoom:2,canvasWidth:320,canvasHeight:240,videoWidth:640,videoHeight:480}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    zoom: 2,
    canvasWidth: 320,
    canvasHeight: 240,
    videoWidth: 640,
    videoHeight: 480
  }
}`,...d.parameters?.docs?.source}}},f=[`Primary`]}))();export{d as Primary,f as __namedExportsOrder,u as default};