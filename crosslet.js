
var scaleSize = d3.scale.sqrt()
                     .domain([6, 4102])
                     .range([3, 20]);
var RdYlBu= ["#D73027", "#F46D43", "#FDAE61", "#FEE090", "#FFFFBF", "#E0F3F8", "#ABD9E9",
 "#74ADD1", "#4575B4"];
var createScale = function(colors, domain, numcol){
    return chroma.scale(colors).domain(domain, numcol);
};
var scaleScore = createScale(RdYlBu, [114,70, 40.5], 9);
var getColor = function(value) {
    return scaleScore(value);
};

(function(d3) {
  var cie = d3.cie = {};

  cie.lab = function(l, a, b) {
    return arguments.length === 1
        ? (l instanceof Lab ? lab(l.l, l.a, l.b)
        : (l instanceof Lch ? lch_lab(l.l, l.c, l.h)
        : rgb_lab((l = d3.rgb(l)).r, l.g, l.b)))
        : lab(+l, +a, +b);
  };

  cie.lch = function(l, c, h) {
    return arguments.length === 1
        ? (l instanceof Lch ? lch(l.l, l.c, l.h)
        : (l instanceof Lab ? lab_lch(l.l, l.a, l.b)
        : lab_lch((l = rgb_lab((l = d3.rgb(l)).r, l.g, l.b)).l, l.a, l.b)))
        : lch(+l, +c, +h);
  };

  cie.interpolateLab = function(a, b) {
    a = cie.lab(a);
    b = cie.lab(b);
    var al = a.l,
        aa = a.a,
        ab = a.b,
        bl = b.l - al,
        ba = b.a - aa,
        bb = b.b - ab;
    return function(t) {
      return lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  };

  cie.interpolateLch = function(a, b) {
    a = cie.lch(a);
    b = cie.lch(b);
    var al = a.l,
        ac = a.c,
        ah = a.h,
        bl = b.l - al,
        bc = b.c - ac,
        bh = b.h - ah;
    if (bh > 180) bh -= 360; else if (bh < -180) bh += 360; // shortest path
    return function(t) {
      return lch_lab(al + bl * t, ac + bc * t, ah + bh * t) + "";
    };
  };

  function lab(l, a, b) {
    return new Lab(l, a, b);
  }

  function Lab(l, a, b) {
    this.l = l;
    this.a = a;
    this.b = b;
  }

  Lab.prototype.brighter = function(k) {
    return lab(Math.min(100, this.l + K * (arguments.length ? k : 1)), this.a, this.b);
  };

  Lab.prototype.darker = function(k) {
    return lab(Math.max(0, this.l - K * (arguments.length ? k : 1)), this.a, this.b);
  };

  Lab.prototype.rgb = function() {
    return lab_rgb(this.l, this.a, this.b);
  };

  Lab.prototype.toString = function() {
    return this.rgb() + "";
  };

  function lch(l, c, h) {
    return new Lch(l, c, h);
  }

  function Lch(l, c, h) {
    this.l = l;
    this.c = c;
    this.h = h;
  }

  Lch.prototype.brighter = function(k) {
    return lch(Math.min(100, this.l + K * (arguments.length ? k : 1)), this.c, this.h);
  };

  Lch.prototype.darker = function(k) {
    return lch(Math.max(0, this.l - K * (arguments.length ? k : 1)), this.c, this.h);
  };

  Lch.prototype.rgb = function() {
    return lch_lab(this.l, this.c, this.h).rgb();
  };

  Lch.prototype.toString = function() {
    return this.rgb() + "";
  };

  // Corresponds roughly to RGB brighter/darker
  var K = 18;

  // D65 standard referent
  var X = 0.950470, Y = 1, Z = 1.088830;

  function lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = lab_xyz(x) * X;
    y = lab_xyz(y) * Y;
    z = lab_xyz(z) * Z;
    return d3.rgb(
      xyz_rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
      xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
      xyz_rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
    );
  }

  function rgb_lab(r, g, b) {
    r = rgb_xyz(r);
    g = rgb_xyz(g);
    b = rgb_xyz(b);
    var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / X),
        y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / Y),
        z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / Z);
    return lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }

  function lab_lch(l, a, b) {
    var c = Math.sqrt(a * a + b * b),
        h = Math.atan2(b, a) / Math.PI * 180;
    return lch(l, c, h);
  }

  function lch_lab(l, c, h) {
    h = h * Math.PI / 180;
    return lab(l, Math.cos(h) * c, Math.sin(h) * c);
  }

  function lab_xyz(x) {
    return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }

  function xyz_lab(x) {
    return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }

  function xyz_rgb(r) {
    return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
  }

  function rgb_xyz(r) {
    return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  }
})(d3);
(function(a){function b(a){return a}function c(a,b){for(var c=0,d=b.length,e=new Array(d);c<d;++c)e[c]=a[b[c]];return e}function e(a){function b(b,c,d,e){while(d<e){var f=d+e>>1;a(b[f])<c?d=f+1:e=f}return d}function c(b,c,d,e){while(d<e){var f=d+e>>1;c<a(b[f])?e=f:d=f+1}return d}return c.right=c,c.left=b,c}function g(a){function b(a,b,c){var e=c-b,f=(e>>>1)+1;while(--f>0)d(a,f,e,b);return a}function c(a,b,c){var e=c-b,f;while(--e>0)f=a[b],a[b]=a[b+e],a[b+e]=f,d(a,1,e,b);return a}function d(b,c,d,e){var f=b[--e+c],g=a(f),h;while((h=c<<1)<=d){h<d&&a(b[e+h])>a(b[e+h+1])&&h++;if(g<=a(b[e+h]))break;b[e+c]=b[e+h],c=h}b[e+c]=f}return b.sort=c,b}function i(a){function c(c,d,e,f){var g=new Array(f=Math.min(e-d,f)),h,i,j,k;for(i=0;i<f;++i)g[i]=c[d++];b(g,0,f);if(d<e){h=a(g[0]);do if(j=a(k=c[d])>h)g[0]=k,h=a(b(g,0,f)[0]);while(++d<e)}return g}var b=g(a);return c}function k(a){function b(b,c,d){for(var e=c+1;e<d;++e){for(var f=e,g=b[e],h=a(g);f>c&&a(b[f-1])>h;--f)b[f]=b[f-1];b[f]=g}return b}return b}function m(a){function c(a,c,e){return(e-c<n?b:d)(a,c,e)}function d(b,d,e){var f=(e-d)/6|0,g=d+f,h=e-1-f,i=d+e-1>>1,j=i-f,k=i+f,l=b[g],m=a(l),n=b[j],o=a(n),p=b[i],q=a(p),r=b[k],s=a(r),t=b[h],u=a(t),v;m>o&&(v=l,l=n,n=v,v=m,m=o,o=v),s>u&&(v=r,r=t,t=v,v=s,s=u,u=v),m>q&&(v=l,l=p,p=v,v=m,m=q,q=v),o>q&&(v=n,n=p,p=v,v=o,o=q,q=v),m>s&&(v=l,l=r,r=v,v=m,m=s,s=v),q>s&&(v=p,p=r,r=v,v=q,q=s,s=v),o>u&&(v=n,n=t,t=v,v=o,o=u,u=v),o>q&&(v=n,n=p,p=v,v=o,o=q,q=v),s>u&&(v=r,r=t,t=v,v=s,s=u,u=v);var w=n,x=o,y=r,z=s;b[g]=l,b[j]=b[d],b[i]=p,b[k]=b[e-1],b[h]=t;var A=d+1,B=e-2,C=x<=z&&x>=z;if(C)for(var D=A;D<=B;++D){var E=b[D],F=a(E);if(F<x)D!==A&&(b[D]=b[A],b[A]=E),++A;else if(F>x)for(;;){var G=a(b[B]);if(G>x){B--;continue}if(G<x){b[D]=b[A],b[A++]=b[B],b[B--]=E;break}b[D]=b[B],b[B--]=E;break}}else for(var D=A;D<=B;D++){var E=b[D],F=a(E);if(F<x)D!==A&&(b[D]=b[A],b[A]=E),++A;else if(F>z)for(;;){var G=a(b[B]);if(G>z){B--;if(B<D)break;continue}G<x?(b[D]=b[A],b[A++]=b[B],b[B--]=E):(b[D]=b[B],b[B--]=E);break}}b[d]=b[A-1],b[A-1]=w,b[e-1]=b[B+1],b[B+1]=y,c(b,d,A-1),c(b,B+2,e);if(C)return b;if(A<g&&B>h){var H,G;while((H=a(b[A]))<=x&&H>=x)++A;while((G=a(b[B]))<=z&&G>=z)--B;for(var D=A;D<=B;D++){var E=b[D],F=a(E);if(F<=x&&F>=x)D!==A&&(b[D]=b[A],b[A]=E),A++;else if(F<=z&&F>=z)for(;;){var G=a(b[B]);if(G<=z&&G>=z){B--;if(B<D)break;continue}G<x?(b[D]=b[A],b[A++]=b[B],b[B--]=E):(b[D]=b[B],b[B--]=E);break}}}return c(b,A,B+1)}var b=k(a);return c}function t(a){return new Array(a)}function u(a,b){return function(c){var d=c.length;return[a.left(c,b,0,d),a.right(c,b,0,d)]}}function v(a,b){var c=b[0],d=b[1];return function(b){var e=b.length;return[a.left(b,c,0,e),a.left(b,d,0,e)]}}function w(a){return[0,a.length]}function x(){return null}function y(){return 0}function z(a){return a+1}function A(a){return a-1}function B(a){return function(b,c){return b+ +a(c)}}function C(a){return function(b,c){return b-a(c)}}function D(){function p(b){var c=f,d=b.length;return d&&(e=e.concat(b),k=r(k,f+=d),n.forEach(function(a){a(b,c,d)})),a}function q(a){function P(b,d,e){H=b.map(a),I=J(F(e),0,e),H=c(H,I);var g=K(H),h=g[0],i=g[1],j;for(j=0;j<h;++j)k[I[j]+d]|=p;for(j=i;j<e;++j)k[I[j]+d]|=p;if(!d){t=H,D=I,N=h,O=i;return}var l=t,m=D,n=0,o=0;t=new Array(f),D=E(f,f);for(j=0;n<d&&o<e;++j)l[n]<H[o]?(t[j]=l[n],D[j]=m[n++]):(t[j]=H[o],D[j]=I[o++]+d);for(;n<d;++n,++j)t[j]=l[n],D[j]=m[n];for(;o<e;++o,++j)t[j]=H[o],D[j]=I[o]+d;g=K(t),N=g[0],O=g[1]}function Q(a,b,c){L.forEach(function(a){a(H,I,b,c)}),H=I=null}function R(a){var b,c,d,e=a[0],f=a[1],g=[],h=[];if(e<N)for(b=e,c=Math.min(N,f);b<c;++b)k[d=D[b]]^=p,g.push(d);else if(e>N)for(b=N,c=Math.min(e,O);b<c;++b)k[d=D[b]]^=p,h.push(d);if(f>O)for(b=Math.max(e,O),c=f;b<c;++b)k[d=D[b]]^=p,g.push(d);else if(f<O)for(b=Math.max(N,f),c=O;b<c;++b)k[d=D[b]]^=p,h.push(d);return N=e,O=f,l.forEach(function(a){a(p,g,h)}),o}function S(a){return a==null?V():Array.isArray(a)?U(a):T(a)}function T(a){return R((K=u(d,a))(t))}function U(a){return R((K=v(d,a))(t))}function V(){return R((K=w)(t))}function W(a){var b=[],c=O,d;while(--c>=N&&a>0)k[d=D[c]]||(b.push(e[d]),--a);return b}function X(a){var b=[],c=N,d;while(c<O&&a>0)k[d=D[c]]||(b.push(e[d]),--a),c++;return b}function Y(a){function K(b,c,g,i){function Q(){++n===m&&(p=s(p,j<<=1),h=s(h,j),m=G(j))}var o=d,p=E(n,m),t=v,u=F,w=n,y=0,z=0,A,B,C,D,K,L;J&&(t=u=x),d=new Array(n),n=0,h=w>1?r(h,f):E(f,m),w&&(C=(B=o[0]).key);while(z<i&&!((D=a(b[z]))>=D))++z;while(z<i){if(B&&C<=D){K=B,L=C,p[y]=n;if(B=o[++y])C=B.key}else K={key:D,value:u()},L=D;d[n]=K;while(!(D>L)){h[A=c[z]+g]=n,k[A]&q||(K.value=t(K.value,e[A]));if(++z>=i)break;D=a(b[z])}Q()}while(y<w)d[p[y]=n]=o[y++],Q();if(n>y)for(y=0;y<g;++y)h[y]=p[h[y]];A=l.indexOf(H),n>1?(H=M,I=O):(n===1?(H=N,I=P):(H=x,I=x),h=null),l[A]=H}function M(a,b,c){if(a===p||J)return;var f,g,i,j;for(f=0,i=b.length;f<i;++f)k[g=b[f]]&q||(j=d[h[g]],j.value=v(j.value,e[g]));for(f=0,i=c.length;f<i;++f)(k[g=c[f]]&q)===a&&(j=d[h[g]],j.value=w(j.value,e[g]))}function N(a,b,c){if(a===p||J)return;var f,g,h,i=d[0];for(f=0,h=b.length;f<h;++f)k[g=b[f]]&q||(i.value=v(i.value,e[g]));for(f=0,h=c.length;f<h;++f)(k[g=c[f]]&q)===a&&(i.value=w(i.value,e[g]))}function O(){var a,b;for(a=0;a<n;++a)d[a].value=F();for(a=0;a<f;++a)k[a]&q||(b=d[h[a]],b.value=v(b.value,e[a]))}function P(){var a,b=d[0];b.value=F();for(a=0;a<f;++a)k[a]&q||(b.value=v(b.value,e[a]))}function Q(){return J&&(I(),J=!1),d}function R(a){var b=o(Q(),0,d.length,a);return u.sort(b,0,b.length)}function S(a,b,d){return v=a,w=b,F=d,J=!0,c}function T(){return S(z,A,y)}function U(a){return S(B(a),C(a),y)}function V(a){function b(b){return a(b.value)}return o=i(b),u=g(b),c}function W(){return V(b)}function X(){return n}var c={top:R,all:Q,reduce:S,reduceCount:T,reduceSum:U,order:V,orderNatural:W,size:X},d,h,j=8,m=G(j),n=0,o,u,v,w,F,H=x,I=x,J=!0;return arguments.length<1&&(a=b),l.push(H),L.push(K),K(t,D,0,f),T().orderNatural()}function Z(){var a=Y(x),b=a.all;return delete a.all,delete a.top,delete a.order,delete a.orderNatural,delete a.size,a.value=function(){return b()[0].value},a}var o={filter:S,filterExact:T,filterRange:U,filterAll:V,top:W,bottom:X,group:Y,groupAll:Z},p=1<<h++,q=~p,t,D,H,I,J=m(function(a){return H[a]}),K=w,L=[],N=0,O=0;return n.unshift(P),n.push(Q),h>j&&(k=s(k,j<<=1)),P(e,0,f),Q(e,0,f),o}function t(){function i(a,d,g){var i;if(h)return;for(i=d;i<f;++i)k[i]||(b=c(b,e[i]))}function j(a,f,g){var i,j,l;if(h)return;for(i=0,l=f.length;i<l;++i)k[j=f[i]]||(b=c(b,e[j]));for(i=0,l=g.length;i<l;++i)k[j=g[i]]===a&&(b=d(b,e[j]))}function m(){var a;b=g();for(a=0;a<f;++a)k[a]||(b=c(b,e[a]))}function o(b,e,f){return c=b,d=e,g=f,h=!0,a}function p(){return o(z,A,y)}function q(a){return o(B(a),C(a),y)}function r(){return h&&(m(),h=!1),b}var a={reduce:o,reduceCount:p,reduceSum:q,value:r},b,c,d,g,h=!0;return l.push(j),n.push(i),i(e,0,f),p()}function D(){return f}var a={add:p,dimension:q,groupAll:t,size:D},e=[],f=0,h=0,j=8,k=o(0),l=[],n=[];return arguments.length?p(arguments[0]):a}function E(a,b){return(b<257?o:b<65537?p:q)(a)}function F(a){var b=E(a,a);for(var c=-1;++c<a;)b[c]=c;return b}function G(a){return a===8?256:a===16?65536:4294967296}D.version="1.1.0",D.permute=c;var d=D.bisect=e(b);d.by=e;var f=D.heap=g(b);f.by=g;var h=D.heapselect=i(b);h.by=i;var j=D.insertionsort=k(b);j.by=k;var l=D.quicksort=m(b);l.by=m;var n=32,o=t,p=t,q=t,r=b,s=b;typeof Uint8Array!="undefined"&&(o=function(a){return new Uint8Array(a)},p=function(a){return new Uint16Array(a)},q=function(a){return new Uint32Array(a)},r=function(a,b){var c=new a.constructor(b);return c.set(a),c},s=function(a,b){var c;switch(b){case 16:c=p(a.length);break;case 32:c=q(a.length);break;default:throw new Error("invalid array width!")}return c.set(a),c}),a.crossfilter=D})(this);topojson = (function() {

  function merge(topology, arcs) {
    var arcsByEnd = {},
        fragmentByStart = {},
        fragmentByEnd = {};

    arcs.forEach(function(i) {
      var e = ends(i);
      (arcsByEnd[e[0]] || (arcsByEnd[e[0]] = [])).push(i);
      (arcsByEnd[e[1]] || (arcsByEnd[e[1]] = [])).push(~i);
    });

    arcs.forEach(function(i) {
      var e = ends(i),
          start = e[0],
          end = e[1],
          f, g;

      if (f = fragmentByEnd[start]) {
        delete fragmentByEnd[f.end];
        f.push(i);
        f.end = end;
        if (g = fragmentByStart[end]) {
          delete fragmentByStart[g.start];
          var fg = g === f ? f : f.concat(g);
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
        } else if (g = fragmentByEnd[end]) {
          delete fragmentByStart[g.start];
          delete fragmentByEnd[g.end];
          var fg = f.concat(g.map(function(i) { return ~i; }).reverse());
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByStart[end]) {
        delete fragmentByStart[f.start];
        f.unshift(i);
        f.start = start;
        if (g = fragmentByEnd[start]) {
          delete fragmentByEnd[g.end];
          var gf = g === f ? f : g.concat(f);
          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
        } else if (g = fragmentByStart[start]) {
          delete fragmentByStart[g.start];
          delete fragmentByEnd[g.end];
          var gf = g.map(function(i) { return ~i; }).reverse().concat(f);
          fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByStart[start]) {
        delete fragmentByStart[f.start];
        f.unshift(~i);
        f.start = end;
        if (g = fragmentByEnd[end]) {
          delete fragmentByEnd[g.end];
          var gf = g === f ? f : g.concat(f);
          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
        } else if (g = fragmentByStart[end]) {
          delete fragmentByStart[g.start];
          delete fragmentByEnd[g.end];
          var gf = g.map(function(i) { return ~i; }).reverse().concat(f);
          fragmentByStart[gf.start = g.end] = fragmentByEnd[gf.end = f.end] = gf;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByEnd[end]) {
        delete fragmentByEnd[f.end];
        f.push(~i);
        f.end = start;
        if (g = fragmentByEnd[start]) {
          delete fragmentByStart[g.start];
          var fg = g === f ? f : f.concat(g);
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
        } else if (g = fragmentByStart[start]) {
          delete fragmentByStart[g.start];
          delete fragmentByEnd[g.end];
          var fg = f.concat(g.map(function(i) { return ~i; }).reverse());
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.start] = fg;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else {
        f = [i];
        fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
      }
    });

    function ends(i) {
      var arc = topology.arcs[i], p0 = arc[0], p1 = [0, 0];
      arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
      return [p0, p1];
    }

    var fragments = [];
    for (var k in fragmentByEnd) fragments.push(fragmentByEnd[k]);
    return fragments;
  }

  function mesh(topology, o, filter) {
    var arcs = [];

    if (arguments.length > 1) {
      var geomsByArc = [],
          geom;

      function arc(i) {
        if (i < 0) i = ~i;
        (geomsByArc[i] || (geomsByArc[i] = [])).push(geom);
      }

      function line(arcs) {
        arcs.forEach(arc);
      }

      function polygon(arcs) {
        arcs.forEach(line);
      }

      function geometry(o) {
        geom = o;
        geometryType[o.type](o.arcs);
      }

      var geometryType = {
        LineString: line,
        MultiLineString: polygon,
        Polygon: polygon,
        MultiPolygon: function(arcs) { arcs.forEach(polygon); }
      };

      o.type === "GeometryCollection"
          ? o.geometries.forEach(geometry)
          : geometry(o);

      geomsByArc.forEach(arguments.length < 3
          ? function(geoms, i) { arcs.push([i]); }
          : function(geoms, i) { if (filter(geoms[0], geoms[geoms.length - 1])) arcs.push([i]); });
    } else {
      for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push([i]);
    }

    return object(topology, {type: "MultiLineString", arcs: merge(topology, arcs)});
  }

  function object(topology, o) {
    var tf = topology.transform,
        kx = tf.scale[0],
        ky = tf.scale[1],
        dx = tf.translate[0],
        dy = tf.translate[1],
        arcs = topology.arcs;

    function arc(i, points) {
      if (points.length) points.pop();
      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, x = 0, y = 0, p; k < n; ++k) points.push([
        (x += (p = a[k])[0]) * kx + dx,
        (y += p[1]) * ky + dy
      ]);
      if (i < 0) reverse(points, n);
    }

    function line(arcs) {
      var points = [];
      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
      return points;
    }

    function polygon(arcs) {
      return arcs.map(line);
    }

    function geometry(o) {
      o = Object.create(o);
      o.coordinates = geometryType[o.type](o.arcs);
      return o;
    }

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: function(arcs) { return arcs.map(polygon); }
    };

    return o.type === "GeometryCollection"
        ? (o = Object.create(o), o.geometries = o.geometries.map(geometry), o)
        : geometry(o);
  }

  function reverse(array, n) {
    var t, j = array.length, i = j - n; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
  }

  function bisect(a, x) {
    var lo = 0, hi = a.length;
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (a[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function neighbors(topology, objects) {
    var objectsByArc = [],
        neighbors = objects.map(function() { return []; });

    function line(arcs, i) {
      arcs.forEach(function(a) {
        if (a < 0) a = ~a;
        var o = objectsByArc[a] || (objectsByArc[a] = []);
        if (!o[i]) o.forEach(function(j) {
          var n, k;
          k = bisect(n = neighbors[i], j); if (n[k] !== j) n.splice(k, 0, j);
          k = bisect(n = neighbors[j], i); if (n[k] !== i) n.splice(k, 0, i);
        }), o[i] = i;
      });
    }

    function polygon(arcs, i) {
      arcs.forEach(function(arc) { line(arc, i); });
    }

    function geometry(o, i) {
      geometryType[o.type](o.arcs, i);
    }

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
    };

    objects.forEach(geometry);
    return neighbors;
  }

  return {
    version: "0.0.4",
    mesh: mesh,
    object: object,
    neighbors: neighbors
  };
})();
barChart=function() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 5, right: 10, bottom: 20, left: 10},
        x,
        //y = d3.scale.log().clamp(true).range([20, 0]),
        y = d3.scale.pow().exponent(0.01).clamp(true).range([20, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round,
        tickFormat,
        tickSize,
        filter=null,
        name_id,
        status,
        fill;

    function chart(div) {
      
     //debugger;
      var width = x.range()[1],
          height = y.range()[0];
      //debugger;
      y.domain([group.top(1)[0].value/100, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          var svg = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id",name_id)
              if(fill)
              {
              fill_svg=svg.append("defs").append("linearGradient").attr("id","lg-"+id)
               .attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%")
               var rr=x.copy().domain([0,20]).range(x.range)
               for(var i=0;i<20;i++)
               {
                fill_svg.append("stop").attr("stop-color",fill(i)).attr("offset",i*5+"%").attr("stop-opacity","1")
               }
             }
           /*
             <defs>
    <linearGradient id="myLinearGradient1"
                    x1="0%" y1="0%"
                    x2="0%" y2="100%"
                    spreadMethod="pad">
      <stop offset="0%"   stop-color="#00cc00" stop-opacity="1"/>
      <stop offset="100%" stop-color="#006600" stop-opacity="1"/>
    </linearGradient>
  </defs>
           */
           g=svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
          /*status=svg.append("text").attr("class","title").attr("x",width-margin.left).attr("y",10)
          .attr("width",150)
          .attr("height",20).text("")*/
          if(filter)
            status.text(axis.tickFormat()(filter[0])+" - "+axis.tickFormat()(filter[1]))
          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")")
              .attr("fill","url(#lg-"+id+")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        //console.log("ha")
        while (++i < n) {
          d = groups[i];
          //console.log(d.value +" - "+ y(d.value))
          //debugger;
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h4.5V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      //div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      
        dimension.filterRange(extent);
        filter=extent
      if(extent[1]-extent[0]>0)    
        {
          if(status)
           status.text(axis.tickFormat()(extent[0])+" - "+axis.tickFormat()(extent[1]))
      }
      else
      {
        if(status)
          status.text("")
      }
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        //div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
        filter=null
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.tickFormat = function(_) {
      if (!arguments.length) return tickFormat;
      tickFormat = _;
      axis.tickFormat(tickFormat)
      return chart;
    };

    chart.name_id = function(_) {
      if (!arguments.length) return name_id;
      name_id = _;
      return chart;
    };

    chart.ticks = function(a) {
      if (!arguments.length) return tickSize;
      ticks = a;
      if(a.length){
        axis.tickValues(ticks);
        //console.log(ticks);
        }
      else
        axis.ticks(ticks);
      return chart;
    };
    
    chart.fill = function(_) {
      if (!arguments.length) return fill;
      fill = _;
      return chart;
    };


    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (!arguments.length) return filter;
      if (_) {
        filter=_
        brush.extent(_);
        dimension.filterRange(_);
        if(status)
               status.text(axis.tickFormat()(filter[0])+" - "+axis.tickFormat()(filter[1]))
      } else {
        brush.clear();
        filter=null
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  };
  var crosslet;

crosslet = {};

if (!_) console.log("Please include underscore.js");

crosslet.createConfig = function(defaultConfig, config) {
  var c;
  return c = jQuery.extend(true, jQuery.extend(true, {}, defaultConfig), config);
};

crosslet.id = function(d) {
  return d;
};

crosslet.idf = function(d) {
  return crosslet.id;
};

crosslet.notimplemented = function() {
  throw "This function is not set. Please check your config.";
};

crosslet.changeSelect = function(select, val) {
  return $(select).find("option").filter(function() {
    return $(this).val() === val;
  }).attr('selected', true);
};

crosslet.defaultConfig = {
  map: {
    leaflet: {
      key: "--your key--",
      styleId: 64657,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    },
    view: {
      center: [51.505, -0.09],
      zoom: 11
    },
    geo: {
      url: "please specify correct location of your geojson",
      name_field: "name",
      id_field: "code",
      topo_object: "please specify correct object name"
    }
  }
};

({
  data: {
    version: "1.0",
    id_field: "id"
  },
  dimensions: {},
  defaults: {
    colorscale: d3.scale.linear().domain([1, 10, 20]).range(["green", "yellow", "red"]).interpolate(d3.cie.interpolateLab),
    opacity: 0.75,
    order: []
  }
});

crosslet.defaultDimensionConfig = {
  p: {},
  filter: null,
  data: {
    interval: null,
    filter: null,
    field: function(d) {
      return d.id;
    },
    dataSet: crosslet.notimplemented,
    method: d3.tsv,
    preformat: function(dd) {
      return function(d) {
        return +d;
      };
    },
    ticks: 4,
    colorscale: d3.scale.linear().domain([1, 10, 20]).range(["green", "yellow", "red"]).interpolate(d3.cie.interpolateLab),
    exponent: 1
  },
  format: {
    short: function(d) {
      return d3.format(",.2f");
    },
    long: function(d) {
      return d.format.short(d);
    },
    input: function(d) {
      return d3.format(".2f");
    },
    axis: function(d) {
      return d.format.short(d);
    }
  },
  render: {
    legend: function(d, el) {
      var f, html;
      f = d.title ? d.title : d.data.field_func(d);
      html = '<h2>' + f + '</h2>';
      return el.html(html);
    },
    range: function(d, el) {
      var html;
      html = "<p><span class='m0'>" + d.format.short(d)(d.filter[0]) + "</span> &ndash; <span class='m1'>" + d.format.short(d)(d.filter[1]) + "</span></p>";
      return el.html(html);
    },
    form: function(d, el) {
      return d.render.legend(d, el);
    },
    rangeForm: function(d, el) {
      var html, size;
      size = _.max(_.map(d.data.interval, function(dd) {
        return ("_" + d.format.input(d)(dd)).length - 1;
      }));
      html = "Range: <input type='text' name='m0' size='" + size + "' value='" + d.format.input(d)(d.filter[0]) + "'> &ndash; <input type='text' name='m1' size='3' value='" + d.format.input(d)(d.filter[1]) + "'>";
      return el.html(html);
    }
  },
  submitter: function(d, el) {
    var out;
    out = {};
    $(el).find("input, select").each(function(index, el) {
      return out[$(el).attr("name")] = $(el).val();
    });
    return out;
  }
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

crosslet.DataStore = (function() {

  DataStore.prototype.data = {};

  DataStore.prototype.geometries = null;

  DataStore.prototype.isGeoLoaded = false;

  DataStore.prototype.isDataLoaded = false;

  function DataStore(initData) {
    this.loadGeo = __bind(this.loadGeo, this);
    var _ref, _ref2;
    this.geoURL = initData.map.geo.url;
    this.version = initData.data.version;
    this.idField = (_ref = initData.data.id_field) != null ? _ref : "id";
    this.geoIdField = (_ref2 = initData.map.geo.id_field) != null ? _ref2 : "id";
    if (!window.dataloader) window.dataloader = new crosslet.DataLoader();
    this.l = window.dataloader;
  }

  DataStore.prototype.addData = function(data, callback) {
    var d, k, v, _i, _len;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      d = data[_i];
      if (!this.data[d[this.idField]]) this.data[d[this.idField]] = {};
      for (k in d) {
        v = d[k];
        if (v !== "" && !_.isNaN(+v)) this.data[d[this.idField]][k] = +v;
      }
    }
    this.isDataLoaded = true;
    if (callback) return callback(data);
  };

  DataStore.prototype.loadData = function(url, callback, method) {
    var _this = this;
    if (!method) method = d3.tsv;
    this.l.load(url, method, function(data) {
      return _this.addData(data, callback);
    });
    return this;
  };

  DataStore.prototype.get_bounds_topo = function(c) {
    var a, f, i, o, _i, _j, _len, _len2, _ref, _ref2;
    o = [];
    _ref = [_.min, _.max];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      a = [];
      _ref2 = [0, 1];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        i = _ref2[_j];
        a.push(f(_.map(c, function(d) {
          return f(_.map(d.coordinates[0], function(dd) {
            return dd[i];
          }));
        })));
      }
      o.push(a);
    }
    return o;
  };

  DataStore.prototype.loadGeo = function(url, geoIdField, callback, topo_objectName) {
    var _this = this;
    return this.l.load(url, d3.json, function(t) {
      var f, _i, _len, _ref;
      if (t.arcs) {
        t = topojson.object(t, t.objects[topo_objectName]);
        _this.geometries = t.geometries;
      } else {
        _this.geometries = t.features;
      }
      _this.bounds = d3.geo.bounds(t);
      _ref = _this.geometries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        if (f.properties) {
          if (!_this.data[f.properties[_this.geoIdField]]) {
            _this.data[f.properties[_this.geoIdField]] = f.properties;
          } else {
            _this.data[f.properties[_this.geoIdField]] = jQuery.extend(true, _this.data[f.properties[_this.geoIdField]], f.properties);
          }
          _this.data[f.properties[_this.geoIdField]].bbox = d3.geo.bounds(f);
        }
      }
      _this.isGeoLoaded = true;
      if (callback) callback(_this);
      return _this;
    });
  };

  return DataStore;

})();

crosslet.DataLoader = (function() {

  DataLoader.prototype.cache = {};

  DataLoader.prototype.status = {};

  DataLoader.prototype.callbackList = {};

  function DataLoader(version) {
    if (!version) version = 1 + ".0";
    this.version = version;
    this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
  }

  DataLoader.prototype.load = function(url, method, callback) {
    var urlv,
      _this = this;
    urlv = url + this.version;
    if (!this.callbackList[urlv]) this.callbackList[urlv] = [];
    if (!this.status[urlv]) this.status[urlv] = "init";
    if (callback) this.callbackList[urlv].push(callback);
    if (__indexOf.call(this.cache, urlv) >= 0) {
      this.executeCallbacks(this.callbackList[urlv], this.cache[urlv]);
      return this;
    } else {
      if (this.status[urlv] !== "loading") {
        this.status[urlv] = "loading";
        method(url, function(data) {
          _this.cache[urlv] = data;
          _this.executeCallbacks(_this.callbackList[urlv], _this.cache[urlv]);
          _this.status[urlv] = "done";
          return _this;
        });
      }
    }
    return this;
  };

  DataLoader.prototype.executeCallbacks = function(list, data) {
    var _results;
    _results = [];
    while (list.length > 0) {
      _results.push(list.pop()(data));
    }
    return _results;
  };

  return DataLoader;

})();
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

crosslet.PanelView = (function(_super) {

  __extends(PanelView, _super);

  function PanelView() {
    this.renderCubes = __bind(this.renderCubes, this);
    this.createCube = __bind(this.createCube, this);
    this.setActive = __bind(this.setActive, this);
    this._renderMap = __bind(this._renderMap, this);
    PanelView.__super__.constructor.apply(this, arguments);
  }

  PanelView.prototype.initialize = function(el, config, parent) {
    var e, o, _i, _len, _ref;
    this.config = crosslet.createConfig(crosslet.defaultConfig, config);
    this.parent = parent;
    this.el = el;
    this.ds = parent.ds;
    this.boxes = {};
    this.render();
    this.width = 200;
    this.active = this.config.defaults.active ? this.config.defaults.active : this.config.defaults.order[0];
    this.numloads = this.config.defaults.order.length;
    _ref = this.config.defaults.order;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      o = _ref[_i];
      e = $("<div class='box'></div>");
      this.boxes[o] = new crosslet.BoxView(e, this.config.dimensions[o], this, o);
      $(this.el).append(e);
    }
    this.boxes[this.active].setActive(true);
    this.renderMap = _.debounce(this._renderMap, 300);
    return this.boxes;
  };

  PanelView.prototype.loaded = function() {
    this.numloads = this.numloads - 1;
    if (this.numloads <= 0) return this.createCube();
  };

  PanelView.prototype._renderMap = function() {
    var abox, adata, f, k, keys, out, _i, _len,
      _this = this;
    abox = this.boxes[this.active];
    adata = abox.getFilteredData();
    keys = this.intersection(_.map(_.values(this.boxes), function(b) {
      return _.keys(b.getFilteredData()).sort();
    }));
    out = {};
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      k = keys[_i];
      out[k] = adata[k];
    }
    f = abox.config.format.long(abox.config);
    this.parent.renderMap(out, (function(v) {
      return abox.config.data.colorscale(abox.config.scale(v));
    }), function(data, value) {
      return data.properties[_this.config.map.geo.name_field] + " - " + f(value);
    });
    return this;
  };

  PanelView.prototype.setActive = function(activeBox) {
    if (activeBox !== this.active) {
      this.boxes[this.active].setActive(false);
      this.active = activeBox;
      this.boxes[this.active].setActive(true);
      return this.renderMap();
    }
  };

  PanelView.prototype.intersection = function(a) {
    var intersect_safe, o, out, _i, _len, _ref;
    intersect_safe = function(a, b) {
      var ai, bi, result;
      ai = bi = 0;
      result = [];
      while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) ai++;
        if (a[ai] > b[bi]) bi++;
        if (a[ai] === b[bi]) {
          result.push(a[ai]);
          ai++;
          bi++;
        }
      }
      return result;
    };
    switch (a.length) {
      case 0:
        return a;
      case 1:
        return a[0];
      case 2:
        return intersect_safe(a[0], a[1]);
      default:
        out = a[0];
        _ref = a.slice(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          out = intersect_safe(out, o);
        }
        return out;
    }
  };

  PanelView.prototype.createCube = function() {
    var bName, box, brushevent, chart, d, dg, getRounder, groups, int, js_bName, js_box, key, keys, o, row, t1, t15, t2, yscale, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    this.rows = [];
    t1 = new Date().getTime();
    keys = _.map(_.values(this.boxes), function(b) {
      return _.keys(b.data).sort();
    });
    t15 = new Date().getTime();
    int = this.intersection(keys);
    for (_i = 0, _len = int.length; _i < _len; _i++) {
      key = int[_i];
      row = {};
      _ref = this.boxes;
      for (bName in _ref) {
        box = _ref[bName];
        row[bName] = box.data[key];
      }
      this.rows.push(row);
    }
    t2 = new Date().getTime();
    this.cube = crossfilter(this.rows);
    getRounder = function(m1, m2, w, exp) {
      var scale, t;
      t = 5 * (m2 - m1) / w;
      scale = d3.scale.pow().exponent(exp).range([m1 / t, m2 / t]).domain([m1 / t, m2 / t]);
      return function(d) {
        return t * scale.invert(Math.floor(scale(+d / t)));
      };
    };
    groups = {};
    this.charts = {};
    brushevent = function(box, ctx) {
      return function() {
        box.event_click();
        return ctx.renderCubes();
      };
    };
    _ref2 = this.boxes;
    for (bName in _ref2) {
      box = _ref2[bName];
      var chart, js_box,js_bName;
      js_box = box;
      js_bName = bName;
      d = this.cube.dimension(function(dd) {
        return dd[bName];
      });
      dg = d.group(getRounder(box.config.data.interval[0], box.config.data.interval[1], this.width - 20, box.config.data.exponent));
      box.graph.empty();
      yscale = d3.scale.linear().clamp(true).range([20, 0]);
      chart = barChart().dimension(d).name_id(bName).group(dg).x(d3.scale.pow().exponent(box.config.data.exponent).domain(box.config.data.interval).rangeRound([0, this.width - 20])).y(yscale.copy()).ticks(box.config.data.ticks).tickFormat(box.config.format.axis(box.config)).fill(box.config.data.colorscale);
      chart.on("brush", brushevent(box, this));
      chart.on("brushend", this.renderCubes);
      box.chart = chart;
      this.charts[bName] = chart;
    }
    if (this.parent.ds.isGeoLoaded) this.renderCubes();
    _ref3 = this.config.defaults.order;
    for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
      o = _ref3[_j];
      if (this.config.dimensions[o].filter) {
        this.boxes[o].setFilter(this.config.dimensions[o].filter, true);
      }
    }
    return this;
  };

  PanelView.prototype.renderCubes = function() {
    var abox, bName, box, _ref;
    _ref = this.boxes;
    for (bName in _ref) {
      box = _ref[bName];
      box.chart(box.graph);
      $(box.el).on("mousedown", box.event_click);
      box.setFilter(box.chart.filter(), false);
    }
    abox = this.boxes[this.active];
    abox.setFilter(abox.chart.filter(), false);
    this.renderMap();
    return this;
  };

  return PanelView;

})(Backbone.View);

crosslet.BoxView = (function(_super) {

  __extends(BoxView, _super);

  function BoxView() {
    this.setFilter = __bind(this.setFilter, this);
    this.event_click = __bind(this.event_click, this);
    this.setActive = __bind(this.setActive, this);
    this.dataLoaded = __bind(this.dataLoaded, this);
    BoxView.__super__.constructor.apply(this, arguments);
  }

  BoxView.prototype.initialize = function(el, config, parent, name) {
    this.el = el;
    this.config = crosslet.createConfig(crosslet.defaultDimensionConfig, config);
    this.config.id = name;
    this.config.data.field_func = !_.isFunction(this.config.data.field) ? (function(d) {
      return d.data.field;
    }) : this.config.data.field;
    $(this.el).on("mousedown", this.event_click);
    $(this.el).on("tap", this.event_click);
    $(this.el)[0].onmousedown = $(this.el)[0].ondblclick = L.DomEvent.stopPropagation;
    this.legend = {};
    this.legend.all = $("<div class='legend'></div>");
    this.legend.text = $("<div class='legendText'></div>");
    this.legend.text_p = $("<div class='legendText_p'></div>");
    this.legend.text_range = $("<div class='legendText_range'></div>");
    this.legend.text.append(this.legend.text_p).append(this.legend.text_range);
    this.legend.form = $("<div class='legendForm'></div>");
    this.legend.form_p = $("<div class='legendForm_p'></div>");
    this.legend.form_range = $("<div class='legendForm_range'></div>");
    this.legend.form.append(this.legend.form_p).append(this.legend.form_range);
    this.legend.all.append(this.legend.text).append(this.legend.form);
    $(el).append(this.legend.all);
    this.graph = $("<div class='graph'></div>");
    $(el).append(this.graph);
    this.parent = parent;
    this.ds = parent.ds;
    this.active = false;
    this.name = name;
    return this.loadData();
  };

  BoxView.prototype.loadData = function() {
    if (_.isString(this.config.data.dataSet)) {
      return this.parent.ds.loadData(this.config.data.dataSet, this.dataLoaded, this.config.data.method);
    } else {
      if (_.isFunction(this.config.data.dataSet)) {
        return this.parent.ds.loadData(this.config.data.dataSet(this.config), this.dataLoaded, this.config.data.method);
      } else {
        return this.parent.ds.addData(this.config.data.dataSet, this.dataLoaded);
      }
    }
  };

  BoxView.prototype.dataLoaded = function() {
    var f, id, pd, preformatter, val, _ref;
    this.data = {};
    f = this.config.data.field_func(this.config);
    preformatter = this.config.data.preformat(this.config);
    _ref = this.parent.ds.data;
    for (id in _ref) {
      val = _ref[id];
      if (_.isNumber(val[f])) pd = preformatter(val[f]);
      if (_.isNumber(pd)) this.data[id] = pd;
    }
    if (!this.config.data.interval) {
      this.config.data.interval = [_.min(_.values(this.data)), _.max(_.values(this.data))];
    }
    if (!this.config.filter) {
      this.config.filter = [_.min(_.values(this.data)), _.max(_.values(this.data))];
    }
    this.config.scale = d3.scale.pow().exponent(this.config.data.exponent).domain(this.config.data.interval).rangeRound([0, 20]);
    this.config.scale.name = "yes";
    this.render();
    return this.parent.loaded();
  };

  BoxView.prototype.setActive = function(isActive) {
    this.active = isActive;
    if (isActive) {
      return $(this.el).addClass("selected");
    } else {
      return $(this.el).removeClass("selected");
    }
  };

  BoxView.prototype.event_click = function(event) {
    if (!this.active) this.parent.setActive(this.name);
    return true;
  };

  BoxView.prototype.setFilter = function(f, redrawCube) {
    if (redrawCube == null) redrawCube = false;
    if (redrawCube) {
      this.chart.filter(f);
      this.parent.renderCubes();
    }
    if (!f) f = this.config.data.interval;
    this.config.filter = f;
    this.filterElements[0].val(this.config.format.input(this.config)(f[0]));
    this.filterElements[1].val(this.config.format.input(this.config)(f[1]));
    $(this.legend.text_range).find(".m0").text(this.config.format.short(this.config)(f[0]));
    $(this.legend.text_range).find(".m1").text(this.config.format.short(this.config)(f[1]));
    return this;
  };

  BoxView.prototype.getFilteredData = function() {
    var f, k, out, v, _ref, _ref2;
    if (!this.chart.filter()) return this.data;
    f = (_ref = this.chart.filter()) != null ? _ref : this.config.data.interval;
    out = {};
    _ref2 = this.data;
    for (k in _ref2) {
      v = _ref2[k];
      if ((f[0] <= v && v <= f[1])) out[k] = v;
    }
    return out;
  };

  BoxView.prototype.renderRange = function() {
    this.config.render.range(this.config, this.legend.text_range);
    return this.config.render.rangeForm(this.config, this.legend.form_range);
  };

  BoxView.prototype.render = function() {
    var _this = this;
    this.config.render.legend(this.config, this.legend.text_p);
    this.config.render.form(this.config, this.legend.form_p);
    this.renderRange();
    $(this.legend.form_range).find("input").on("change", function() {
      var f;
      f = [+_this.filterElements[0].val(), +_this.filterElements[1].val()];
      if (f[0] > f[1]) f.reverse();
      f[0] = _.max([_this.config.data.interval[0], f[0]]);
      f[1] = _.min([_this.config.data.interval[1], f[1]]);
      if (_.isEqual(f, _this.config.data.interval)) f = null;
      return _this.setFilter(f, true);
    });
    $(this.legend.form_p).find("input, select").on("change", function() {
      var p;
      _this.config.data.interval = null;
      _this.config.scale = null;
      _this.config.filter = null;
      p = _this.config.submitter(_this.config, _this.legend.form_p);
      _this.config.p = p;
      console.log(p);
      return _this.loadData();
    });
    return this.filterElements = [$(this.legend.form_range).find("input[name=m0]"), $(this.legend.form_range).find("input[name=m1]")];
  };

  return BoxView;

})(Backbone.View);
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

crosslet.MapView = (function(_super) {

  __extends(MapView, _super);

  function MapView() {
    this._renderMap = __bind(this._renderMap, this);
    this.hover = __bind(this.hover, this);
    this.mouseMove = __bind(this.mouseMove, this);
    this.reset = __bind(this.reset, this);
    this.beforezoom = __bind(this.beforezoom, this);
    this.project = __bind(this.project, this);
    MapView.__super__.constructor.apply(this, arguments);
  }

  MapView.prototype.initialize = function(el, config) {
    var _this = this;
    this.config = crosslet.createConfig(crosslet.defaultConfig, config);
    this.geoURL = this.config.map.geo.url;
    this.opacity = this.config.defaults.opacity;
    this.ds = new crosslet.DataStore(this.config);
    this.el = el;
    this.hoverFunc = this.default_hover;
    $(this.el).attr("class", "crosslet");
    this.map = L.map(el[0]).setView(this.config.map.view.center, this.config.map.view.zoom);
//Changed to use toner tiles

    L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png", this.config.map.leaflet).addTo(this.map);

// captions
var info =  L.control({position: 'bottomright'}); 

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Minimum COMIPEMS Scores</h4>' +  
                           'Each point on the map represents a school<br/>or technical carreer' +
' with the size of the dot<br/>representing the number of students.<br/>'+ 
                          'Filter the schools using the top right widget,<br/>' +
        ' or center on your location using the widget<br/>underneath the zoom controls';
};

info.addTo(this.map);

L.control.locate({drawCircle: false, locateOptions: {enableHighAccuracy: true } }).addTo(this.map);
//this.map.locate({setView : true});
this.map.setMaxBounds([
    [20.026057,-98.13949584960938],
    [18.935963, -99.780078125]
]);

//replace the tooltip that comes with crosslet to one that uses div
// so I can use <br> inside the tooltip
      tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip");
      function mouseover(d){
          tooltip
              .style("visibility", "visible")
      }
      
      
      function mousemove(d){
          tooltip
              .style("visibility", "visible")
              .style("top", d3.event.pageY + "px")
              .style("left", d3.event.pageX + "px")
              .html(d.properties.name + "<br/>" +
                    (d.properties.especialidad == ""?"": d.properties.especialidad + "<br\>") +
                    "Minimum score to enter: <big><b>" +d.properties.min2013 + "</b></big><br\>" +
                    "Number of students admitted: " + d.properties.nstudents);  /* \n does not work in
                                                                          creating a line break*/
      }
      
      function mouseout(){
          tooltip
              .style("visibility", "hidden");
      }
      
      /* END of MODIFICATIONS */
      
      

    this.control = $("<div class='crosslet_panel'></div>");
    this.info = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function(map) {
        return _this.control[0];
      }
    });
    this.map.addControl(new this.info());
    this.panel = new crosslet.PanelView(this.control, this.config, this);
    this.renderMap = this._renderMap;
    return this.ds.loadGeo(this.geoURL, this.config.map.geo.id_field, function(ds) {
      _this.bounds = _this.ds.bounds;
// Changed to create a point map with pointRadius
      _this.path = d3.geo.path().projection(_this.project).pointRadius(function (d) {return Math.sqrt(d.properties.nstudents/7)+2});
      _this.svg = d3.select(_this.map.getPanes().overlayPane).append("svg");
      _this.g = _this.svg.append("g");
      _this.g.attr("class", "crosslet_geometry");
      //_this.feature = _this.g.selectAll("path").data(ds.geometries).enter().append("path")
//.attr("id", function(d) {
      //  return "path_" + d.properties[_this.config.map.geo.id_field];
      //}).on("mouseover", function(d) {
      //  return _this.hover(d);
      //}).on("mousemove", _this.mouseMove);
_this.feature = _this.g.selectAll("path").data(ds.geometries).enter().append("path")
.attr("id", function(d) {
        return "path_" + d.properties[_this.config.map.geo.id_field];
      }).on("mouseover", function(d) { return mouseover(d) })
                        .on("mousemove", function(d) { return mousemove(d) })
                        .on("mouseout", mouseout);


      _this.reset();
      _this.map.on("viewreset", _this.reset);
      _this.map.on("zoomstart", _this.beforezoom);
//to avoid a black rectangle comment out crosslet's original tooltip
      //_this.hoverElement = _this.svg.append("g").attr("class", "hover");
     // _this.hoverElementRect = _this.hoverElement.append("svg:rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 30).attr("rx", 5).attr("ry", 5);
      //_this.hoverElementText = _this.hoverElement.append("text").attr("x", 0).attr("y", 0);
      _this.hoverElementTextBB = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
      };
      if (_this.panel.numloads <= 0) return _this.panel.createCube();
    }, this.config.map.geo.topo_object);
  };

  MapView.prototype.project = function(x) {
    var point;
    point = this.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y];
  };

  MapView.prototype.beforezoom = function() {
    return this.g.style("display", "none");
  };

  MapView.prototype.reset = function() {
    var bottomLeft, topRight;
    bottomLeft = this.project(this.bounds[0]);
    topRight = this.project(this.bounds[1]);
    this.svg.attr("width", topRight[0] - bottomLeft[0]).attr("height", bottomLeft[1] - topRight[1]).style("margin-left", bottomLeft[0] + "px").style("margin-top", topRight[1] + "px");
    this.g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
    this.feature.attr("d", this.path);
    this.g.style("display", "inline");
    return true;
  };

  MapView.prototype.mouseMove = function() {
    var br, dx, dy, matrix, pos, trp;
    br = jQuery.browser;
    pos = d3.mouse(this.svg.node());
    if (br.mozilla) {
      trp = this.svg.node().parentNode.parentNode.parentNode;
      matrix = $(trp).css("transform").split('(')[1].split(')')[0].split(',');
      dx = +matrix[4];
      dy = +matrix[5];
      pos[0] -= dx;
      pos[1] -= dy;
    }
    pos[0] += 30;
    pos[1] += 30;
    if (this.hoverElementTextBB.width + pos[0] >= this.svg.attr("width")) {
      pos[0] -= this.hoverElementTextBB.width + 60;
    }
    if (this.hoverElementTextBB.height + pos[1] >= this.svg.attr("height")) {
      pos[1] -= this.hoverElementTextBB.height + 60;
    }
    return this.hoverElement.attr("transform", "translate(" + pos[0] + "," + pos[1] + ")");
  };

  MapView.prototype.hover = function(data) {
    var text;
    text = this.hoverFunc(data, data.properties.value);
    this.hoverElementText.text(text);
    this.hoverElementTextBB = this.hoverElementText.node().getBBox();
    return this.hoverElementRect.attr("width", this.hoverElementTextBB.width + 10).attr("height", this.hoverElementTextBB.height + 10).attr("x", this.hoverElementTextBB.x - 5).attr("y", this.hoverElementTextBB.y - 5);
  };

  MapView.prototype.default_hover = function(data, value) {
    return data.properties[this.config.map.geo.name_field] + " - " + value;
  };

  MapView.prototype._renderMap = function(data, formatter, hoverFunc) {
    var _this = this;
    if (hoverFunc) this.hoverFunc = hoverFunc;
    this.feature.attr("style", function(d) {
      var id;
      id = d.properties[_this.config.map.geo.id_field];
      d.properties.value = data[id];
      if (_.isNumber(data[id])) {
        return "fill: " + formatter(d.properties.value);
      } else {
        return "display:none";
      }
    });
    return this;
  };

  return MapView;

})(Backbone.View);
