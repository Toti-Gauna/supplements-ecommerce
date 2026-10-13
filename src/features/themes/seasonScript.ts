import { seasonalThemes, themeSettings } from "@/demo/fixtures/themes";
import { ADMIN_STORE_VERSION, STORAGE_PREFIX } from "@/stores/storage";
import { SKINS } from "./skins";

/**
 * Script del <head>: decide la temática ANTES de pintar (vista previa de "Probar temáticas", modo del panel y
 * fechas, guardados en localStorage) y marca `data-season`: el acento de temporada sale sin parpadeo. Repite la regla de `currentTheme` (src/demo/engine/themes.ts);
 * después de hidratar, ThemeStage la vuelve a aplicar con el engine. El panel queda sin temática.
 */
const defaults = seasonalThemes.map(({ id, active, startsOn, endsOn }) => ({ id, active, startsOn, endsOn }));
const skins = Object.fromEntries(Object.keys(SKINS).map((id) => [id, 1]));

export const seasonScript = `(function(){try{
var d=document.documentElement,ls=window.localStorage;
if(ls.getItem("volta-ambient")==="paused")d.classList.add("amb-paused");
if(location.pathname.indexOf("/admin-demo")>-1)return;
var T=${JSON.stringify(defaults)},S=${JSON.stringify(themeSettings)},K=${JSON.stringify(skins)};
function j(k){try{return JSON.parse(ls.getItem(k)||"null")}catch(e){return null}}
var pv=j("${STORAGE_PREFIX}theme-preview"),pid=pv&&pv.state?pv.state.previewId:null;
var ad=j("${STORAGE_PREFIX}admin"),dd=ad&&ad.version===${ADMIN_STORE_VERSION}&&ad.state&&ad.state.data;
if(dd&&dd.themes)T=dd.themes;if(dd&&dd.themeSettings)S=dd.themeSettings;
var id=null;
if(pid==="original")id=null;else if(pid&&K[pid])id=pid;else if(S.mode==="fixed")id=S.fixedId;else if(S.mode==="auto"){
var n=new Date(),md=("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2);
for(var i=0;i<T.length;i++){var t=T[i],f=t.startsOn.slice(5),e=t.endsOn.slice(5);
if(t.active&&(f<=e?md>=f&&md<=e:md>=f||md<=e)){id=t.id;break}}}
if(id&&K[id])d.setAttribute("data-season",id);
}catch(e){}})();`;
