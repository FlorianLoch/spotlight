(function(c,m){typeof exports=="object"&&typeof module<"u"?m(exports):typeof define=="function"&&define.amd?define(["exports"],m):(c=typeof globalThis<"u"?globalThis:c||self,m(c.Spotlight={}))})(this,function(c){"use strict";function m(e,t){e.classList.add(t)}function M(e,t){e.classList.remove(t)}function he(e,t,n){n?m(e,t):M(e,t)}function Ot(e){for(var t in e)t.startsWith("_s_")&&e.style.setProperty(t.substring(3),e[t])}function f(e,t,n){n=""+n,e["_s_"+t]!==n&&(e.style.setProperty(t,n),e["_s_"+t]=n)}let at=0;function me(e,t){t&&(f(e,"transition","none"),t()),at||(at=e.clientTop&&0),t&&f(e,"transition","")}function _e(e,t){e.firstChild.nodeValue=t}function ft(e,t){return(t||document).getElementsByClassName(e)}function y(e,t,n,o){J(!0,e,t,n,o)}function J(e,t,n,o,l){t[(e?"add":"remove")+"EventListener"](n,o,l||l===!1?l:!0)}function ge(e,t){e.stopPropagation(),t&&e.preventDefault()}function Ut(e,t){const n=O("a"),o=t.src;n.href=o,n.download=o.substring(o.lastIndexOf("/")+1),e.appendChild(n),n.click(),e.removeChild(n)}function O(e){return document.createElement(e)}function Q(e,t){f(e,"display",t?"":"none")}function Z(e,t){f(e,"visibility",t?"":"hidden")}function N(e,t){f(e,"transition",t?"":"none")}const $=["info","theme","download","play","page","close","autofit","zoom-in","zoom-out","prev","next","fullscreen"],At={info:1,page:1,close:1,autofit:1,"zoom-in":1,"zoom-out":1,prev:1,next:1,fullscreen:1},b={BACKSPACE:8,ESCAPE:27,SPACEBAR:32,LEFT:37,RIGHT:39,UP:38,NUMBLOCK_PLUS:107,PLUS:187,DOWN:40,NUMBLOCK_MINUS:109,MINUS:189,INFO:73},u=O("div");u.id="spotlight",u.innerHTML="<div class=spl-spinner></div><div class=spl-track><div class=spl-scene><div class=spl-pane></div></div></div><div class=spl-header><div class=spl-page> </div></div><div class=spl-progress></div><div class=spl-footer><div class=spl-title> </div><div class=spl-description> </div><div class=spl-button> </div></div><div class=spl-prev></div><div class=spl-next></div>";const Xe={},Xt=O("video");function ut(e,t,n,o){let l,s;if(o!=="node"){const v=Object.keys(n);for(let ct=0,z;ct<v.length;ct++)if(z=v[ct],z.length>3&&z.indexOf("src")===0)if(o==="video"){const pe=Xe[z];if(pe){if(pe>0){l=n[z];break}}else if(Xt.canPlayType("video/"+z.substring(3).replace("-","").toLowerCase())){Xe[z]=1,l=n[z];break}else Xe[z]=-1}else{const pe=parseInt(z.substring(4),10);if(pe){const Lt=Math.abs(t-pe);(!s||Lt<s)&&(s=Lt,l=n[z])}}}return l||n.src||n.href||e.src||e.href}const ee={},dt=navigator.connection,Yt=window.devicePixelRatio||1;let d,p,B,F,P,I,Ye,Be,S,q,ve,te,ye,R,ne,U,a,w,L,r,Fe,ie,A,pt,be,we,Ce,Ie,ke,H,ze,qe,Re,Se,x,He,Ee,Te,xe,D,C,h,oe,i,De=O("img"),le,Ke,K,se=!1,We,je,Me,Ge,Ve,Je,ht,mt,W,Ne,X,j,_,k,Qe,E,_t;y(document,"click",Ft);function gt(){if(C)return;C=document.body,le=t("scene"),Ke=t("header"),K=t("footer"),We=t("title"),je=t("description"),Me=t("button"),Ge=t("prev"),Ve=t("next"),ht=t("page"),W=t("progress"),Ne=t("spinner"),oe=[t("pane")],T("close",fe),C[E="requestFullscreen"]||C[E="msRequestFullscreen"]||C[E="webkitRequestFullscreen"]||C[E="mozRequestFullscreen"]||(E=""),E?(_t=E.replace("request","exit").replace("mozRequest","mozCancel").replace("Request","Exit"),Je=T("fullscreen",nt)):$.pop(),T("info",rt),T("autofit",Oe),T("zoom-in",ot),T("zoom-out",lt),T("theme",Le),mt=T("play",G),T("download",Nt),y(Ge,"click",Ae),y(Ve,"click",ue);const e=t("track");y(e,"mousedown",St),y(e,"mousemove",Tt),y(e,"mouseleave",tt),y(e,"mouseup",tt),y(e,"touchstart",St,{passive:!1}),y(e,"touchmove",Tt,{passive:!0}),y(e,"touchend",tt),y(Me,"click",function(){Se?Se(a,r):Re&&(location.href=Re)});function t(n){return ee[n]=ft("spl-"+n,u)[0]}}function T(e,t){const n=O("div");return n.className="spl-"+e,y(n,"click",t),Ke.appendChild(n),ee[e]=n}function Bt(e){const t=ee[e];t&&(Ke.removeChild(t),ee[e]=null)}function Ft(e){if(R)return;const t=e.target.closest(".spotlight");if(t){ge(e,!0);const n=t.closest(".spotlight-group");L=ft("spotlight",n);for(let o=0;o<L.length;o++)if(L[o]===t){ie=n&&n.dataset,vt(o+1);break}}}function It(e,t,n){L=e,t&&(ie=t,be=t.onshow,we=t.onchange,Ce=t.onclose,n=n||t.index),vt(n)}function vt(e){if(w=L.length,w){C||gt(),be&&be(e);const t=oe[0],n=t.parentNode;for(let o=oe.length;o<w;o++){const l=t.cloneNode(!1);f(l,"left",o*100+"%"),n.appendChild(l),oe[o]=l}h||(C.appendChild(u),$e()),a=e||1,N(le),Pt(!0),E&&bt(),jt()}}function g(e,t){let n=r[e];return typeof n<"u"?(n=""+n,n!=="false"&&(n||t)):t}function qt(e){r={},ie&&Object.assign(r,ie),Object.assign(r,e.dataset||e),Fe=r.media,Se=r.onclick,ze=r.theme,x=r.class,ke=g("autohide",!0),A=g("infinite"),pt=g("progress",!0),H=g("autoslide"),qe=g("preload",!0),Re=r.buttonHref,He=H&&parseFloat(H)||7,U||ze&&Le(ze),x&&m(u,x),x&&me(u);const t=r.control;if(t){const o=typeof t=="string"?t.split(","):t;for(let l=0;l<$.length;l++)r[$[l]]=!1;for(let l=0;l<o.length;l++){const s=o[l].trim();s==="zoom"?r["zoom-in"]=r["zoom-out"]=!0:r[s]=!0}}const n=r.animation;if(Ee=Te=xe=!n,D=!1,n){const o=typeof n=="string"?n.split(","):n;for(let l=0;l<o.length;l++){const s=o[l].trim();s==="scale"?Ee=!0:s==="fade"?Te=!0:s==="slide"?xe=!0:s&&(D=s)}}Ie=r.fit}function Ze(e){e?me(i,Ze):(N(le,xe),f(i,"opacity",Te?0:1),wt(Ee&&.8),D&&m(i,D))}function Pe(e){if(h=oe[e-1],i=h.firstChild,a=e,i)Mt(),Ie&&m(i,Ie),Ze(!0),D&&M(i,D),Te&&f(i,"opacity",1),Ee&&f(i,"transform",""),f(i,"visibility","visible"),j&&(De.src=j),H&&et(_);else{const t=X.media,n=g("spinner",!0);if(t==="video")re(n,!0),i=O("video"),i.onloadedmetadata=function(){i===this&&(i.onerror=null,i.width=i.videoWidth,i.height=i.videoHeight,ce(),re(n),Pe(e))},i.poster=r.poster,i.preload=qe?"auto":"metadata",i.controls=g("controls",!0),i.autoplay=r.autoplay,i.playsinline=g("inline"),i.muted=g("muted"),i.src=X.src,h.appendChild(i);else if(t==="node"){i=X.src,typeof i=="string"&&(i=document.querySelector(i)),i&&(i._root||(i._root=i.parentNode),i._style||(i._style=i.getAttribute("style")),Ot(i),ce(),h.appendChild(i),Pe(e));return}else re(n,!0),i=O("img"),i.onload=function(){i===this&&(i.onerror=null,re(n),Pe(e),ce())},i.src=X.src,h.appendChild(i);i&&(n||f(i,"visibility","visible"),i.onerror=function(){i===this&&(Ue(i),m(Ne,"error"),re(n))})}}function re(e,t){e&&he(Ne,"spin",t)}function yt(){return document.fullscreen||document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement}function Rt(){if($e(),i&&ce(),E){const e=yt();he(Je,"on",e),e||bt()}}function bt(){Q(Je,screen.availHeight-window.innerHeight>0)}function $e(){P=u.clientWidth,I=u.clientHeight}function ce(){Ye=i.clientWidth,Be=i.clientHeight}function wt(e){f(i,"transform","translate(-50%, -50%) scale("+(e||S)+")")}function Y(e,t){f(h,"transform",e||t?"translate("+e+"px, "+t+"px)":"")}function ae(e,t,n){t?me(le,function(){ae(e,!1,n)}):f(le,"transform","translateX("+(-e*100+(n||0))+"%)")}function Ct(e){J(e,window,"keydown",xt),J(e,window,"wheel",Dt),J(e,window,"resize",Rt),J(e,window,"popstate",Ht)}function Ht(e){h&&e.state.spl&&fe(!0)}function xt(e){if(h){const t=r["zoom-in"]!==!1;switch(e.keyCode){case b.BACKSPACE:t&&Oe();break;case b.ESCAPE:fe();break;case b.SPACEBAR:H&&G();break;case b.LEFT:Ae();break;case b.RIGHT:ue();break;case b.UP:case b.NUMBLOCK_PLUS:case b.PLUS:t&&ot();break;case b.DOWN:case b.NUMBLOCK_MINUS:case b.MINUS:t&&lt();break;case b.INFO:rt();break}}}function Dt(e){if(h&&r["zoom-in"]!==!1){let t=e.deltaY;t=(t<0?1:t?-1:0)*.5,t<0?lt(e,e.clientX,e.clientY):t>0&&ot(e,e.clientX,e.clientY)}}function G(e,t){(typeof e=="boolean"?e:!_)===!_&&(_=_?clearTimeout(_):1,he(mt,"on",_),t||et(_))}function et(e){pt&&(me(W,function(){f(W,"transition-duration",""),f(W,"transform","")}),e&&(f(W,"transition-duration",He+"s"),f(W,"transform","translateX(0)"))),e&&(_=setTimeout(ue,He*1e3))}function V(){ke&&(Qe=Date.now()+2950,k||(m(u,"menu"),kt(3e3)))}function kt(e){k=setTimeout(function(){const t=Date.now();t>=Qe?(M(u,"menu"),k=0):kt(Qe-t)},e)}function zt(e){typeof e=="boolean"&&(k=e?k:0),k?(k=clearTimeout(k),M(u,"menu")):V()}function St(e){ge(e,!0),ve=!0,te=!1,R=!1;let t=e,n=e.touches;q=n,n&&(n=n[0])&&(t=n),ye=Ye*S<=P&&Be*S<=I,B=t.pageX,F=t.pageY,N(h)}function tt(e){if(ge(e),q=null,ve){if(!te)zt();else{if(ye&&te){const t=d<-(P/7)&&(a<w||A),n=t||d>P/7&&(a>1||A);(t||n)&&(ae(a-1,!0,d/P*100),t&&ue()||n&&Ae()),R&&p<-(I/4)?fe():(d=0,p=0),Y()}N(h,!0)}ve=!1}}function Et(e){return Math.sqrt(Math.pow(e[0].clientX-e[1].clientX,2)+Math.pow(e[0].clientY-e[1].clientY,2))}function Kt(e){return[(e[0].clientX+e[1].clientX)*.5,(e[0].clientY+e[1].clientY)*.5]}function Wt(e){if(r["zoom-in"]!==!1&&e&&e.length===2&&q&&q.length===2){const t=Et(e)/Et(q),n=Kt(e);it(t,n[0],n[1],!1)}return q=e,e&&e[0]}function Tt(e){if(ge(e),ve){let t=Wt(e.touches);if(t&&(e=t),!te){const n=B-e.pageX,o=F-e.pageY;R=ye&&o>Math.abs(n)*1.15}if(R)p-=F-(F=e.pageY);else if(ye)d-=B-(B=e.pageX);else{let n=(Ye*S-P)/2,o=Math.abs(n);n>0&&(d-=B-(B=e.pageX)),d>o?d=o:d<-o&&(d=-o),n=(Be*S-I)/2,o=Math.abs(n),n>0&&(p-=F-(F=e.pageY)),p>o?p=o:p<-o&&(p=-o)}te=!0,Y(d,p)}else V()}function nt(e){const t=yt();(typeof e!="boolean"||e!==!!t)&&(t?document[_t]():u[E]())}function Le(e){typeof e!="string"&&(e=U?"":ze||"white"),U!==e&&(U&&M(u,U),e&&m(u,e),U=e)}function Oe(e){typeof e=="boolean"&&(ne=!e),ne=S===1&&!ne,he(i,"autofit",ne),f(i,"transform",""),S=1,d=0,p=0,ce(),N(h),Y()}function it(e,t,n,o){let l=S*e;if(N(h,o),N(i,o),Mt(),l<=1){d=p=0,Y(d,p),st(1);return}if(!(l>50)){if(n){const s=P/2,v=I/2;d=t-(t-d-s)*e-s,p=n-(n-p-v)*e-v}else d*=e,p*=e;Y(d,p),st(l)}}function ot(e,t,n){it(1/.65,t,n,!0)}function lt(e,t,n){it(.65,t,n,!0)}function st(e){S=e||1,wt()}function rt(){se=!se,Z(K,se)}function Mt(){ne&&Oe()}function jt(){history.pushState({spl:1},""),history.pushState({spl:2},""),N(u,!0),m(C,"hide-scrollbars"),m(u,"show"),Ct(!0),$e(),V(),H&&G(!0,!0)}function Nt(){Ut(C,i)}function fe(e){setTimeout(function(){C.removeChild(u),h=i=X=r=ie=L=be=we=Ce=Se=null,R=!1},200),M(C,"hide-scrollbars"),M(u,"show"),nt(!1),Ct(),history.go(e===!0?-1:-2),j&&(De.src=""),_&&G(),i&&Ue(i),k&&(k=clearTimeout(k)),U&&Le(),x&&M(u,x),Ce&&Ce()}function Ue(e){if(e._root)e.setAttribute("style",e._style||""),e._root.appendChild(e),e._root=e._style=null;else{const t=e.parentNode;t&&t.removeChild(e),e.onerror=null,e.src=""}}function Ae(e){if(e&&V(),w>1){if(a>1)return de(a-1);if(A)return ae(w,!0),de(w)}}function ue(e){if(e&&V(),w>1){if(a<w)return de(a+1);if(A)return ae(-1,!0),de(1);_&&G()}}function de(e){if(e!==a){_?(clearTimeout(_),et()):V();const t=e>a;return a=e,Pt(t),!0}}function Gt(e){let t=L[a-1];qt(t);const n=dt&&dt.downlink;let o=Math.max(I,P)*Yt;n&&n*1200<o&&(o=n*1200);let l;if(X={media:Fe,src:ut(t,o,r,Fe),title:g("title",t.alt||t.title||(l=t.firstElementChild)&&(l.alt||l.title))},j&&(De.src=j=""),qe&&e&&(t=L[a])){const s=t.dataset||t,v=s.media;(!v||v==="image")&&(j=ut(t,o,s,v))}for(let s=0;s<$.length;s++){const v=$[s];Q(ee[v],g(v,At[v]))}}function Pt(e){if(d=0,p=0,S=1,i)if(i.onerror)Ue(i);else{let s=i;setTimeout(function(){s&&i!==s&&(Ue(s),s=null)},650),Ze(),Y()}K&&Z(K,!1),Gt(e),ae(a-1),M(Ne,"error"),Pe(a),N(h),Y();const t=X.title,n=g("description"),o=g("button"),l=t||n||o;l&&(t&&_e(We,t),n&&_e(je,n),o&&_e(Me,o),Q(We,t),Q(je,n),Q(Me,o),f(K,"transform",ke==="all"?"":"none")),ke||m(u,"menu"),se=l,Z(K,se),Z(Ge,A||a>1),Z(Ve,A||a<w),_e(ht,w>1?a+" / "+w:""),we&&we(a,r)}c.addControl=T,c.autofit=Oe,c.close=fe,c.download=Nt,c.fullscreen=nt,c.goto=de,c.info=rt,c.init=gt,c.menu=zt,c.next=ue,c.play=G,c.prev=Ae,c.removeControl=Bt,c.show=It,c.theme=Le,c.zoom=st,Object.defineProperty(c,Symbol.toStringTag,{value:"Module"})});
