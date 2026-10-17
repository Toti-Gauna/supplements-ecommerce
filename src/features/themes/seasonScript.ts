import { seasonalThemes, themeCoupons, themeSettings } from "@/demo/fixtures/themes";
import { splashOff } from "@/demo/engine/splash-off";
import { splashLayerMap, SPLASH_ART_VERSION } from "@/demo/engine/splash-scenes";
import { BASE_PATH } from "@/lib/base-path";
import { ADMIN_STORE_VERSION, STORAGE_PREFIX } from "@/stores/storage";
import { SKINS } from "./skins";

/**
 * Script del <head>: decide la temática ANTES de pintar (vista previa de "Probar temáticas", modo del panel y
 * fechas, guardados en localStorage) y marca `data-season`: el acento de temporada sale sin parpadeo. Repite la regla de `currentTheme` (src/demo/engine/themes.ts);
 * después de hidratar, ThemeStage la vuelve a aplicar con el engine. El panel queda sin temática.
 * Con una campaña deja también lo que muestra su pantalla de carga (app/splash.css): el nombre (`--splash-name`), el
 * descuento del cupón para el cuentakilómetros (`splashOff`: `--splash-pre/suf`, `--sd0…2`, `data-splash-dn`) y,
 * si la fecha ya tiene escena propia (R3c, `splash-scenes.ts`), `data-splash-scene` con sus capas en `--sl1…N`,
 * que además se piden ya (preload) para que lleguen antes que la hoja de estilos. Sin escena queda la variante de
 * campaña de R3a (`data-splash-campaign`).
 */
const defaults = seasonalThemes.map(({ id, name, active, startsOn, endsOn, couponCode }) => ({ id, name, active, startsOn, endsOn, couponCode }));
const coupons = themeCoupons.map(({ code, type, value, active }) => ({ code, type, value, active }));
const skins = Object.fromEntries(Object.keys(SKINS).map((id) => [id, 1]));

export const seasonScript = `(function(){try{
var d=document.documentElement,ls=window.localStorage;
if(ls.getItem("volta-ambient")==="paused")d.classList.add("amb-paused");
if(location.pathname.indexOf("/admin-demo")>-1)return;
var T=${JSON.stringify(defaults)},S=${JSON.stringify(themeSettings)},K=${JSON.stringify(skins)},C=${JSON.stringify(coupons)},L=${JSON.stringify(splashLayerMap())};
function j(k){try{return JSON.parse(ls.getItem(k)||"null")}catch(e){return null}}
var pv=j("${STORAGE_PREFIX}theme-preview"),pid=pv&&pv.state?pv.state.previewId:null;
var ad=j("${STORAGE_PREFIX}admin"),dd=ad&&ad.version===${ADMIN_STORE_VERSION}&&ad.state&&ad.state.data;
if(dd&&dd.themes)T=dd.themes;if(dd&&dd.themeSettings)S=dd.themeSettings;if(dd&&dd.coupons)C=dd.coupons;
var id=null;
if(pid==="original")id=null;else if(pid&&K[pid])id=pid;else if(S.mode==="fixed")id=S.fixedId;else if(S.mode==="auto"){
var n=new Date(),md=("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2);
for(var i=0;i<T.length;i++){var t=T[i],f=t.startsOn.slice(5),e=t.endsOn.slice(5);
if(t.active&&(f<=e?md>=f&&md<=e:md>=f||md<=e)){id=t.id;break}}}
if(!id||!K[id])return;
d.setAttribute("data-season",id);
var th=null,c=null,st=d.style,q=JSON.stringify;for(i=0;i<T.length;i++)if(T[i].id===id)th=T[i];
if(!th)return;st.setProperty("--splash-name",q(th.name));d.setAttribute("data-splash-campaign","");
if(L[id]){d.setAttribute("data-splash-scene",id);var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
for(i=1;i<=L[id];i++){var u="${BASE_PATH}/splash/"+id+"/"+i+".svg?v=${SPLASH_ART_VERSION}";st.setProperty("--sl"+i,'url("'+u+'")');
if(!rm){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=u;document.head.appendChild(l)}}}
for(i=0;i<C.length;i++)if(C[i].code===th.couponCode)c=C[i];
var o=(${splashOff.toString()})(c);if(!o)return;
st.setProperty("--splash-pre",q(o.pre));st.setProperty("--splash-suf",q(o.suf));for(i=0;i<3;i++)st.setProperty("--sd"+i,String(o.cols[i]));
d.setAttribute("data-splash-dn",String(o.dn));d.setAttribute("data-splash-off","");
}catch(e){}})();`;
