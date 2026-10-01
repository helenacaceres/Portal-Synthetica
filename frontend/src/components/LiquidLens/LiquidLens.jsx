import { useEffect, useRef, useState } from "react";
import styles from "./LiquidLens.module.css";

// tentei fazer isso só com SVG + backdrop-filter, mas no Safari não desloca
// a cena atrás, só distorce a própria forma — por isso é WebGL.

const MAX_BLOBS = 12;

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
#define N ${MAX_BLOBS}

uniform vec2  uRes;
uniform float uTime;
uniform sampler2D uScene;
uniform int   uCount;
uniform vec3  uBlobs[N];    // xy = centro(px, top-left), z = raio(px)
uniform vec4  uBlobDef[N];  // x=amp, y=freqA, z=freqB, w=fase
uniform vec3  uBg;
uniform float uRefr;

// SDF do blob inlineado no loop: GLSL ES 1.00 só aceita indexar array de
// uniform (uBlobs[i]) diretamente pelo índice do loop, nunca por um 'i'
// que passou por parâmetro de função.
float sceneSDF(vec2 p){
  float d = 1e9;
  for (int i = 0; i < N; i++){
    if (i < uCount){
      vec3 b = uBlobs[i];
      vec4 q = uBlobDef[i];
      vec2 rel = p - b.xy;
      float ang = atan(rel.y, rel.x);
      float def = 0.0;
      def += sin(uTime * q.y + q.w + ang * 3.0) * q.x;
      def += sin(uTime * q.z * 0.7 + q.w * 1.7 + ang * 2.0) * q.x * 0.5;
      def += sin(ang * 7.0 + uTime * 0.55 + q.w) * q.x * 0.14;
      float di = length(rel) - b.z * (1.0 + def);
      float k = 46.0;
      float h = clamp(0.5 + 0.5 * (d - di) / k, 0.0, 1.0);
      d = mix(d, di, h) - k * h * (1.0 - h);
    }
  }
  return d;
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // top-left, casa com o canvas 2D
  float d = sceneSDF(p);
  if (d > 1.0){ gl_FragColor = vec4(0.0); return; }        // fora de tudo -> transparente

  float edgeW = 34.0;
  float rim = 1.0 - clamp(-d / edgeW, 0.0, 1.0);           // 1 no rim, 0 no centro
  // fade que zera o efeito EXATAMENTE na borda (d=0) e cresce ~8px pra dentro
  // -> sem emenda dura entre "letra real" (fora) e "letra deslocada" (dentro)
  float onset = smoothstep(0.0, -13.0, d);
  // perfil de lente: nasce em 0 na borda, pico no "ombro", volta a 0 no centro
  float lens = rim * onset;

  vec2 e = vec2(2.0, 0.0);
  vec2 grad = vec2(
    sceneSDF(p + e.xy) - sceneSDF(p - e.xy),
    sceneSDF(p + e.yx) - sceneSDF(p - e.yx)
  );
  vec2 nrm = normalize(grad + 1e-5);

  vec2 disp = -nrm * (uRefr * lens);
  vec2 uv = p / uRes;
  vec2 duv = disp / uRes;

  vec4 sOrig = texture2D(uScene, uv);
  vec4 sDisp = texture2D(uScene, uv + duv);
  float aR = texture2D(uScene, uv + duv * 1.04).a;
  float aB = texture2D(uScene, uv + duv * 0.96).a;

  vec3 ink = vec3(0.043, 0.043, 0.055);
  // cobertura gentil: a letra REAL aparece por baixo (canvas transparente),
  // o deslocamento entra como eco -> magnifica/ondula, não substitui.
  vec3 col = mix(uBg, ink, sDisp.a);
  col.r = mix(col.r, ink.r, clamp(aR - sDisp.a, 0.0, 1.0) * 0.25);  // franja cromática quase nula
  col.b = mix(col.b, ink.b, clamp(aB - sDisp.a, 0.0, 1.0) * 0.25);
  float coverA = max(sOrig.a, sDisp.a) * 0.55 * onset;

  // --- BORDA (sem onset: é justo na borda que ela precisa aparecer) ---
  float aroClaro = smoothstep(0.0, -3.0, d) * (1.0 - smoothstep(-4.0, -12.0, d));
  float contorno = smoothstep(0.0, -1.5, d) * (1.0 - smoothstep(-1.5, -5.0, d));

  // reflexo LARGO e macio na metade iluminada da lente (não um ponto)
  vec2 lightDir = normalize(vec2(-0.5, -0.82));
  float face = max(dot(nrm, lightDir), 0.0);
  float sheenLargo = pow(face, 3.0) * rim * 0.22;
  float sheenCurto = pow(face, 16.0) * rim * 0.12;

  col += vec3(aroClaro * 0.42 + sheenLargo + sheenCurto);
  col = mix(col, vec3(0.52, 0.56, 0.66), contorno * 0.34);
  col = mix(col, vec3(0.93, 0.94, 0.98), (1.0 - coverA) * 0.035);

  float bordaA = max(aroClaro * 0.5, contorno * 0.4);
  float bodyA = rim * 0.05;

  gl_FragColor = vec4(col, clamp(max(coverA, max(bordaA, max(bodyA, sheenLargo * 1.4 + sheenCurto * 3.0))), 0.0, 1.0));
}
`;

function compilar(gl, tipo, src) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) || "";
    gl.deleteShader(s);
    throw new Error(`${tipo === gl.FRAGMENT_SHADER ? "FRAG" : "VERT"}: ${log || "compile failed"}`);
  }
  return s;
}

function quantidade(w) {
  if (w < 640) return 3;
  if (w < 1024) return 5;
  return 6;
}

// parâmetros de movimento de cada blob, mesmo esquema que eu já usava antes
function criarBlob(indice, total, vw, vh) {
  const colunas = Math.ceil(Math.sqrt(total * (vw / vh)));
  const linhas = Math.ceil(total / colunas);
  const col = indice % colunas;
  const lin = Math.floor(indice / colunas);
  const celW = vw / colunas;
  const celH = vh / linhas;
  const amp = Math.min(celW, celH) * 0.22;
  return {
    baseX: celW * (col + 0.5) + (Math.random() - 0.5) * celW * 0.4,
    baseY: celH * (lin + 0.5) + (Math.random() - 0.5) * celH * 0.4,
    raio: 55 + Math.random() * 85,
    fx: [0.024 + Math.random() * 0.04, 0.014 + Math.random() * 0.026, 0.006 + Math.random() * 0.014],
    fy: [0.021 + Math.random() * 0.04, 0.012 + Math.random() * 0.024, 0.005 + Math.random() * 0.012],
    ax: [amp * 0.6, amp * 0.3, amp * 0.15],
    ay: [amp * 0.55, amp * 0.28, amp * 0.13],
    fase: Math.random() * Math.PI * 2,
    defAmp: 0.08 + Math.random() * 0.1,
    defFreqA: 0.12 + Math.random() * 0.3,
    defFreqB: 0.1 + Math.random() * 0.24,
  };
}

export default function LiquidLens({ limiteRef }) {
  const canvasRef = useRef(null);
  // sem limiteRef, o efeito ficaria visível na página inteira ao rolar —
  // com ele, o canvas some (opacidade) assim que a área indicada (o hero)
  // sai da tela, em vez de continuar flutuando sobre o resto do conteúdo.
  const [dentroDoLimite, setDentroDoLimite] = useState(true);

  useEffect(() => {
    const alvo = limiteRef?.current;
    if (!alvo) return undefined;
    // IntersectionObserver em vez de listener de scroll: não depende de
    // nenhum evento disparar, o navegador calcula a visibilidade sozinho.
    const observer = new IntersectionObserver(([entrada]) => setDentroDoLimite(entrada.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [limiteRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl =
      canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return undefined; // sem WebGL -> nada renderiza, a página segue normal

    let prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compilar(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compilar(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || "link failed");
      }
    } catch (e) {
      console.warn("[LiquidLens] shader indisponível:", e.message);
      return undefined;
    }
    gl.useProgram(prog);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      scene: gl.getUniformLocation(prog, "uScene"),
      count: gl.getUniformLocation(prog, "uCount"),
      blobs: gl.getUniformLocation(prog, "uBlobs[0]"),
      blobDef: gl.getUniformLocation(prog, "uBlobDef[0]"),
      bg: gl.getUniformLocation(prog, "uBg"),
      refr: gl.getUniformLocation(prog, "uRefr"),
    };
    gl.uniform1i(U.scene, 0);
    gl.uniform3f(U.bg, 0.98, 0.976, 0.969);
    gl.uniform1f(U.refr, 8.0); // px de canvas — micro-distorção, sem fantasma

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // sem flip: a textura fica com a linha 0 = topo do canvas 2D, e o shader
    // amostra em espaço top-left (p.y = uRes.y - gl_FragCoord.y) -> casa direto.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    const cena = document.createElement("canvas");
    const cctx = cena.getContext("2d");

    let W = 0;
    let H = 0;
    let dpr = 1;
    let blobs = [];

    function redimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1 : 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cena.width = canvas.width;
      cena.height = canvas.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      const n = quantidade(W);
      blobs = Array.from({ length: n }, (_, i) => criarBlob(i, n, W, H));
      gl.uniform1i(U.count, n);
      const def = new Float32Array(MAX_BLOBS * 4);
      blobs.forEach((b, i) => {
        def[i * 4] = b.defAmp;
        def[i * 4 + 1] = b.defFreqA;
        def[i * 4 + 2] = b.defFreqB;
        def[i * 4 + 3] = b.fase;
      });
      gl.uniform4fv(U.blobDef, def);
    }

    function desenharCena() {
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, W, H);
      const alvos = document.querySelectorAll("[data-lens-scene]");
      alvos.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > H + 200) return;
        const cs = getComputedStyle(el);
        const txt = (el.dataset.lensText || el.textContent || "").trim();
        if (!txt) return;
        cctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        cctx.textBaseline = "middle";
        cctx.fillStyle = "#0b0b0e";
        try {
          cctx.letterSpacing = cs.letterSpacing;
        } catch {
          /* Safari < 17.4 não tem letterSpacing no canvas — tudo bem */
        }
        // "middle" + centro vertical do box casa bem com line-height:1 centrado;
        // o nudge fino compensa a diferença de métrica entre Archivo e o
        // fallback que o canvas usa antes da fonte carregar.
        cctx.fillText(txt, r.left + parseFloat(cs.paddingLeft || 0), r.top + r.height * 0.5 + r.height * 0.04);
      });
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cena);
    }

    redimensionar();
    window.addEventListener("resize", redimensionar);

    const inicio = performance.now();
    let raf = null;
    const arr = new Float32Array(MAX_BLOBS * 3);

    function frameLoop(agora) {
      const t = reduz ? 0 : (agora - inicio) / 1000;
      desenharCena();
      blobs.forEach((b, i) => {
        let ox = 0;
        let oy = 0;
        for (let k = 0; k < 3; k++) {
          ox += Math.sin(t * b.fx[k] * 6.283 + b.fase * (k + 1)) * b.ax[k];
          oy += Math.cos(t * b.fy[k] * 6.283 + b.fase * (k + 1.3)) * b.ay[k];
        }
        arr[i * 3] = (b.baseX + ox) * dpr;
        arr[i * 3 + 1] = (b.baseY + oy) * dpr;
        arr[i * 3 + 2] = b.raio * dpr;
      });
      gl.uniform3fv(U.blobs, arr);
      gl.uniform1f(U.time, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduz) raf = requestAnimationFrame(frameLoop);
    }
    raf = requestAnimationFrame(frameLoop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", redimensionar);
      gl.deleteProgram(prog);
      gl.deleteBuffer(quad);
      gl.deleteTexture(tex);
      // sem loseContext(): em StrictMode o effect roda mount→unmount→mount e
      // perder o contexto aqui deixaria o 2º mount com um contexto morto.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.camada}
      style={{ opacity: dentroDoLimite ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
