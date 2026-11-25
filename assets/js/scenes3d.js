// Procedural 3D scenes — optics, circuits, fields, biology
import * as THREE from 'three';

function mat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.45, metalness: 0.1, envMapIntensity: 0.5 }, opts || {}));
}
function glassMat(color) {
  return new THREE.MeshPhysicalMaterial({
    color: color, transparent: true, opacity: 0.42, roughness: 0.06, metalness: 0,
    transmission: 0.85, thickness: 0.6, ior: 1.5, side: THREE.DoubleSide, envMapIntensity: 1.4
  });
}
function glow(color, opacity) {
  return new THREE.MeshStandardMaterial({ color: color, emissive: new THREE.Color(color), emissiveIntensity: 1.6, roughness: 0.3, transparent: opacity != null, opacity: opacity == null ? 1 : opacity });
}
function metalMat(color, side) {
  return new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 1.0, envMapIntensity: 1.6, side: side || THREE.FrontSide });
}
function tube(points, color, r, emissive) {
  const curve = new THREE.CatmullRomCurve3(points.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }));
  const geo = new THREE.TubeGeometry(curve, Math.max(8, points.length * 6), r || 0.035, 8, false);
  const m = new THREE.Mesh(geo, emissive ? glow(color) : mat(color, { roughness: 0.35 }));
  return m;
}
function line(a, b, color, r) {
  return tube([a, b], color, r, true);
}
function box(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function cyl(rt, rb, h, color, x, y, z, axis) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 24), mat(color));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function sph(r, color, x, y, z, sx, sy, sz) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), mat(color));
  m.position.set(x || 0, y || 0, z || 0);
  m.scale.set(sx || 1, sy || 1, sz || 1);
  return m;
}

function sceneBase(bg) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(bg == null ? 0x0b1220 : bg);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 0.7);
  s.add(hemi);
  const k = new THREE.DirectionalLight(0xffffff, 1.3);
  k.position.set(4, 8, 6);
  s.add(k);
  return s;
}

function finish(scene, list, keys) {
  const meshes = [];
  list.forEach(function (m) {
    if (!m) return;
    scene.add(m);
    if (m.isGroup) {
      m.traverse(function (o) { if (o.isMesh) { meshes.push(o); } });
    } else if (m.isMesh) meshes.push(m);
  });
  return { scene: scene, meshes: meshes, keys: keys || {} };
}

/* ================= OPTICS ================= */

/* Optics ray diagrams — correct rays for every mirror or lens case.
   kind: 'concave-mirror' | 'convex-mirror' | 'convex-lens' | 'concave-lens' */

function axLine(s, list, keys, half) {
  const m = line([-half, 0, 0], [half, 0, 0], 0x94a3b8, 0.02);
  m.userData.key = 'axis';
  (keys.axis = keys.axis || []).push(m);
  list.push(m);
}

function ray3(a, b, col, key, list, keys, r) {
  const m = line(a, b, col, r || 0.028);
  m.userData.key = key;
  (keys[key] = keys[key] || []).push(m);
  list.push(m);
  return m;
}

function dash3(a, b, key, list, keys) {
  const m = line(a, b, 0x94a3b8, 0.016);
  m.material.transparent = true;
  m.material.opacity = 0.5;
  m.userData.key = key;
  (keys[key] = keys[key] || []).push(m);
  list.push(m);
  return m;
}

function arrow3(x, h, col, key, list, keys) {
  ray3([x, 0, 0], [x, h, 0], col, key, list, keys, 0.05);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 10), mat(col));
  head.position.set(x, h + (h >= 0 ? 0.1 : -0.1), 0);
  if (h < 0) head.rotation.z = Math.PI;
  head.userData.key = key;
  (keys[key] = keys[key] || []).push(head);
  list.push(head);
}

function dot3(x, label, list, keys, col) {
  const p = sph(0.1, col || 0xef4444, x, 0, 0);
  p.userData.key = label;
  (keys[label] = keys[label] || []).push(p);
  list.push(p);
}

function label3(text, x, y, col, list, keys) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 70px system-ui, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(2,6,23,0.9)';
  ctx.strokeText(text, 128, 64);
  ctx.fillStyle = col || '#f8fafc';
  ctx.fillText(text, 128, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(1.0, 0.5, 1);
  sp.position.set(x, y, 0);
  sp.userData.key = 'label';
  (keys.label = keys.label || []).push(sp);
  list.push(sp);
  return sp;
}

export function optics(kind, caseIdx) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  const f0 = 2.2;
  const isMirror = kind.indexOf('mirror') >= 0;
  const convex = kind.indexOf('convex') >= 0;
  const f = isMirror ? (convex ? -f0 : f0) : (convex ? f0 : -f0);

  const U = isMirror
    ? (convex ? [1e6, 5.0] : [1e6, 6.2, 2 * f0, 3.3, f0, 1.4])
    : (convex ? [1e6, 6.6, 2 * f0, 3.3, f0, 1.4] : [1e6, 5.0]);
  const idx = Math.max(0, Math.min(caseIdx || 0, U.length - 1));
  const u = U[idx];
  const inf = u > 100;
  const h = 0.9;

  let v, imgX, imgH;
  if (inf) {
    v = f;
    imgH = 0;
  } else {
    v = (u * f) / (u - f);
    imgH = -h * v / u;
  }
  imgX = isMirror ? -v : v;
  const real = isMirror ? imgX < 0 : imgX > 0;
  const atF = !inf && Math.abs(u - f) < 0.05;

  const focusA = isMirror ? -f : f;
  const focusB = -f;

  axLine(s, list, keys, 7.5);

  if (isMirror) {
    let surf;
    if (convex) {
      const g = new THREE.SphereGeometry(6, 40, 24, Math.PI / 2 - 0.28, 0.56, Math.PI / 2 - 0.3, 0.6);
      surf = new THREE.Mesh(g, metalMat(0xe8eef5, THREE.DoubleSide));
      surf.rotation.y = Math.PI / 2;
    } else {
      const g = new THREE.SphereGeometry(6, 40, 24, -Math.PI / 2 - 0.28, 0.56, Math.PI / 2 - 0.3, 0.6);
      surf = new THREE.Mesh(g, metalMat(0xe8eef5, THREE.DoubleSide));
      surf.rotation.y = -Math.PI / 2;
    }
    surf.userData.key = 'mirror';
    keys.mirror = [surf];
    list.push(surf);
  } else {
    let lens;
    if (convex) {
      lens = sph(1.5, 0x93c5fd, 0, 0, 0, 0.55, 1.5, 1.5);
    } else {
      lens = cyl(1.1, 1.1, 0.4, 0x93c5fd, 0, 0, 0, 'z');
    }
    lens.material = glassMat(0x93c5fd);
    lens.userData.key = 'lens';
    keys.lens = [lens];
    list.push(lens);
  }

  dot3(focusA, 'F', list, keys);
  label3('F', focusA, 0.34, '#fca5a5', list, keys);
  if (isMirror) {
    const cx = convex ? -f : -2 * f0;
    dot3(cx, 'C', list, keys);
    label3('C', cx, 0.34, '#fca5a5', list, keys);
  } else {
    dot3(-focusA, 'F2', list, keys);
    dot3(2 * focusA, '2F', list, keys);
    dot3(-2 * focusA, '2F2', list, keys);
    label3('2F', 2 * focusA, 0.34, '#fca5a5', list, keys);
    label3('2F', -2 * focusA, 0.34, '#fca5a5', list, keys);
  }

  const objX = inf ? -6.8 : -u;

  if (!inf) {
    arrow3(objX, h, 0x38bdf8, 'object', list, keys);
    label3('O', objX, h + 0.38, '#7dd3fc', list, keys);
  }

  const y2 = inf ? h : h * focusB / (focusB + u);
  const outDir = isMirror ? -1 : 1;

  if (inf) {
    ray3([-7.5, h, 0], [0, h, 0], 0xfbbf24, 'incident', list, keys, 0.03);
    if (isMirror) ray3([0, h, 0], [-Math.abs(focusA), 0, 0], 0xfbbf24, 'reflected', list, keys, 0.03);
    else ray3([0, h, 0], [Math.abs(focusA), 0, 0], 0xfbbf24, 'refracted', list, keys, 0.03);
  } else if (atF) {
    // object at focus — image at infinity, kirane parallel nikalti hain
    ray3([objX, h, 0], [0, h, 0], 0xfbbf24, 'incident', list, keys, 0.03);
    ray3([0, h, 0], [focusA, 0, 0], 0xfbbf24, isMirror ? 'reflected' : 'refracted', list, keys, 0.03);
    ray3([objX, h, 0], [0, 0, 0], 0x34d399, 'incident2', list, keys, 0.026);
    ray3([0, 0, 0], [isMirror ? -Math.abs(f) : Math.abs(f), -h, 0], 0x34d399, isMirror ? 'reflected' : 'refracted', list, keys, 0.026);
  } else {
    ray3([objX, h, 0], [0, h, 0], 0xfbbf24, 'incident', list, keys, 0.03);
    if (real) {
      ray3([0, h, 0], [imgX, imgH, 0], 0xfbbf24, isMirror ? 'reflected' : 'refracted', list, keys, 0.03);
    } else {
      const ex = outDir * 3.4;
      const ey = h + (0 - h) * (ex / focusA);
      ray3([0, h, 0], [ex, ey, 0], 0xfbbf24, isMirror ? 'reflected' : 'refracted', list, keys, 0.03);
      dash3([ex, ey, 0], [imgX, imgH, 0], 'extension', list, keys);
    }
    ray3([objX, h, 0], [0, y2, 0], 0x34d399, 'incident2', list, keys, 0.026);
    if (real) {
      ray3([0, y2, 0], [imgX, imgH, 0], 0x34d399, isMirror ? 'reflected' : 'refracted', list, keys, 0.026);
    } else {
      const ex = outDir * 3.4;
      ray3([0, y2, 0], [ex, y2, 0], 0x34d399, isMirror ? 'reflected' : 'refracted', list, keys, 0.026);
      dash3([ex, y2, 0], [imgX, imgH, 0], 'extension', list, keys);
    }
  }

  if (inf) {
    dot3(imgX, 'image', list, keys, 0xf472b6);
    label3('I', imgX, 0.34, '#f9a8d4', list, keys);
  } else if (atF) {
    // Image at infinity — no-op (parallel rays)
  } else if (real) {
    arrow3(imgX, imgH, 0xf472b6, 'image', list, keys);
    label3('I', imgX, imgH + 0.38, '#f9a8d4', list, keys);
  } else {
    const m = line([imgX, 0, 0], [imgX, imgH, 0], 0xf472b6, 0.03);
    m.material.transparent = true;
    m.material.opacity = 0.55;
    m.userData.key = 'image';
    (keys.image = keys.image || []).push(m);
    list.push(m);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 10), mat(0xf472b6));
    head.position.set(imgX, imgH + (imgH >= 0 ? 0.09 : -0.09), 0);
    if (imgH < 0) head.rotation.z = Math.PI;
    head.userData.key = 'image';
    (keys.image = keys.image || []).push(head);
    list.push(head);
    label3('I', imgX, imgH + 0.38, '#f9a8d4', list, keys);
  }

  return finish(s, list, keys);
}

export function glassSlab() {
  const s = sceneBase();
  const keys = {};
  const list = [];
  const slab = box(0.5, 3.2, 2.2, 0x93c5fd, 0, 0, 0);
  slab.material = glassMat(0x93c5fd);
  slab.userData.key = 'slab'; keys.slab = [slab]; list.push(slab);
  const top = line([-2.6, 1.2, 0], [0, 1.2, 0], 0xfbbf24, 0.03);
  top.userData.key = 'incident'; keys.incident = [top]; list.push(top);
  const inside = line([0, 1.2, 0], [0.22, -1.0, 0], 0xfbbf24, 0.03);
  inside.userData.key = 'inside'; keys.inside = [inside]; list.push(inside);
  const out = line([0.22, -1.0, 0], [2.6, -1.0, 0], 0xf472b6, 0.03);
  out.userData.key = 'emergent'; keys.emergent = [out]; list.push(out);
  const norm = line([0, 1.7, 0], [0, -1.7, 0], 0x64748b, 0.015);
  norm.userData.key = 'normal'; keys.normal = [norm]; list.push(norm);
  return finish(s, list, keys);
}

export function prism(disperse) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  const g = new THREE.CylinderGeometry(2.0, 2.0, 3.0, 3, 1);
  const p = new THREE.Mesh(g, glassMat(0xbae6fd));
  p.rotation.z = Math.PI / 6;
  p.position.y = 0.4;
  p.userData.key = 'prism'; keys.prism = [p]; list.push(p);
  const inRay = line([-3.4, 1.6, 0], [-0.9, 0.9, 0], 0xfbbf24, 0.03);
  inRay.userData.key = 'incident'; keys.incident = [inRay]; list.push(inRay);
  if (disperse) {
    const cols = [0xef4444, 0xf97316, 0xfacc15, 0x22c55e, 0x3b82f6, 0x8b5cf6];
    cols.forEach(function (c, i) {
      const y = 0.9 - i * 0.12;
      const r = line([-0.9, y, 0], [2.8, y - 1.4 - i * 0.22, 0], c, 0.026);
      r.userData.key = 'spectrum' + i;
      (keys['spectrum' + i] = keys['spectrum' + i] || []).push(r);
      list.push(r);
    });
  } else {
    const r = line([-0.9, 0.9, 0], [2.8, -0.5, 0], 0xfbbf24, 0.03);
    r.userData.key = 'refracted'; keys.refracted = [r]; list.push(r);
  }
  return finish(s, list, keys);
}

export function eyeDefect(kind) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  const ball = sph(1.0, 0xf1f5f9, 1.4, 0, 0);
  ball.userData.key = 'eyeball'; keys.eyeball = [ball]; list.push(ball);
  const lens = sph(0.35, 0x93c5fd, 0.15, 0, 0, 0.5, 1, 1);
  lens.material = glassMat(0x93c5fd);
  lens.userData.key = 'lens'; keys.lens = [lens]; list.push(lens);
  const retina = new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 16, Math.PI / 2 + 0.5, Math.PI - 1.0), mat(0xfca5a5, { side: THREE.DoubleSide }));
  retina.position.set(1.4, 0, 0);
  retina.userData.key = 'retina'; keys.retina = [retina]; list.push(retina);
  const corr = kind === 'myopia'
    ? sph(0.42, 0x93c5fd, -0.9, 0, 0, 0.5, 1.1, 1.1)
    : sph(0.5, 0x93c5fd, -0.9, 0, 0, 0.55, 1.1, 1.1);
  corr.material = glassMat(0x93c5fd);
  corr.userData.key = 'correction'; keys.correction = [corr]; list.push(corr);
  const focal = kind === 'myopia' ? 0.6 : 2.1;
  [ -2.6, -1.6 ].forEach(function (x, i) {
    const r = line([x, 0.7 - i * 0.7, 0], [i === 0 ? focal : 0.15, 0, 0], 0xfbbf24, 0.026);
    r.userData.key = i === 0 ? 'ray1' : 'ray2';
    (keys[i === 0 ? 'ray1' : 'ray2'] = keys[i === 0 ? 'ray1' : 'ray2'] || []).push(r);
    list.push(r);
  });
  return finish(s, list, keys);
}

/* ================= CIRCUITS ================= */

export function circuit(kind) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  const wc = 0xb87333;
  const wire = function (a, b) {
    const w = tube([a, b], wc, 0.05, false);
    w.material.metalness = 0.85;
    w.material.roughness = 0.28;
    w.userData.key = 'wire';
    (keys.wire = keys.wire || []).push(w);
    list.push(w);
  };
  // battery
  const bat = box(0.5, 1.0, 0.5, 0x16a34a, -2.4, 0, 0);
  bat.userData.key = 'cell'; keys.cell = [bat]; list.push(bat);
  const capP = cyl(0.12, 0.12, 0.14, 0xd1d5db, -2.4, 0.56, 0);
  capP.material = metalMat(0xd1d5db); list.push(capP);
  const bulb = sph(0.35, 0xffd27a, 2.2, 0.6, 0);
  bulb.material = glow(0xffc24b);
  bulb.userData.key = 'bulb'; keys.bulb = [bulb]; list.push(bulb);
  if (kind === 'series') {
    [-0.6, 0.6].forEach(function (x, i) {
      const r = cyl(0.16, 0.16, 0.7, 0xf97316, x, -0.8, 0, 'z');
      r.userData.key = 'R' + (i + 1);
      keys['R' + (i + 1)] = [r]; list.push(r);
    });
    wire([-2.4, 0.5, 0], [-2.4, 1.6, 0]);
    wire([-2.4, 1.6, 0], [2.2, 1.6, 0]);
    wire([2.2, 1.6, 0], [2.2, 0.95, 0]);
    wire([2.2, 0.25, 0], [2.2, -1.6, 0]);
    wire([2.2, -1.6, 0], [-0.95, -1.6, 0]);
    wire([-0.25, -1.6, 0], [-2.4, -1.6, 0]);
    wire([-2.4, -1.6, 0], [-2.4, -0.5, 0]);
    // resistors on bottom
    list.push(cyl(0.16, 0.16, 0.7, 0xf97316, -0.6, -1.6, 0, 'x'));
    list.push(cyl(0.16, 0.16, 0.7, 0xf97316, 0.6, -1.6, 0, 'x'));
    keys.R1.push(list[list.length - 2]); keys.R2.push(list[list.length - 1]);
  } else if (kind === 'parallel') {
    [-0.7, 0.7].forEach(function (x, i) {
      const r = cyl(0.16, 0.16, 0.7, 0xf97316, x, 0.6, 0, 'z');
      r.userData.key = 'R' + (i + 1);
      keys['R' + (i + 1)] = [r]; list.push(r);
    });
    wire([-2.4, 0.5, 0], [-2.4, 1.7, 0]);
    wire([-2.4, 1.7, 0], [2.2, 1.7, 0]);
    wire([2.2, 1.7, 0], [2.2, -0.2, 0]);
    wire([2.2, -0.2, 0], [-2.4, -0.2, 0]);
    wire([-2.4, -0.2, 0], [-2.4, -0.5, 0]);
    [-0.7, 0.7].forEach(function (x) { wire([x, 1.7, 0], [x, 0.95, 0]); wire([x, 0.25, 0], [x, -0.2, 0]); });
  } else if (kind === 'domestic') {
    const board = box(3.4, 1.4, 0.3, 0xf1f5f9, 0, 0, 0);
    board.userData.key = 'board'; keys.board = [board]; list.push(board);
    [-1.2, -0.4, 0.4, 1.2].forEach(function (x, i) {
      const sw = box(0.24, 0.5, 0.24, i < 2 ? 0xef4444 : 0x3b82f6, x, 0, 0.25);
      sw.userData.key = 'switch' + (i + 1);
      keys['switch' + (i + 1)] = [sw]; list.push(sw);
    });
    const meter = box(0.7, 0.7, 0.3, 0xfacc15, 0, -1.2, 0);
    meter.userData.key = 'meter'; keys.meter = [meter]; list.push(meter);
    wire([-2.6, -1.2, 0], [-0.35, -1.2, 0]);
    wire([0.35, -1.2, 0], [2.6, -1.2, 0]);
    wire([2.6, -1.2, 0], [2.6, 0.6, 0]);
    wire([2.6, 0.6, 0], [1.4, 0.6, 0]);
  } else {
    // symbols
    const items = [
      ['cell', box(0.5, 1.0, 0.5, 0x22c55e, -2.4, 0, 0)],
      ['switch', box(0.6, 0.3, 0.3, 0xef4444, -1.2, 0, 0)],
      ['bulb', sph(0.35, 0xfacc15, 0, 0, 0)],
      ['resistor', cyl(0.16, 0.16, 0.8, 0xf97316, 1.2, 0, 0, 'x')],
      ['ammeter', sph(0.32, 0x38bdf8, 2.3, 0, 0)],
      ['voltmeter', sph(0.32, 0xa855f7, 2.3, 1.2, 0)]
    ];
    items.forEach(function (it) {
      it[1].userData.key = it[0];
      keys[it[0]] = [it[1]];
      list.push(it[1]);
    });
    wire([-1.9, 0, 0], [-1.5, 0, 0]);
    wire([-0.9, 0, 0], [-0.35, 0, 0]);
    wire([0.35, 0, 0], [0.8, 0, 0]);
    wire([1.6, 0, 0], [2.0, 0, 0]);
  }
  return finish(s, list, keys);
}

/* ================= FIELDS ================= */

export function field(kind) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  if (kind === 'bar') {
    const bar = box(3.0, 0.7, 0.7, 0xef4444, 0, 0, 0);
    bar.userData.key = 'N'; keys.N = [bar]; list.push(bar);
    const half = box(3.0, 0.7, 0.7, 0x3b82f6, 0, 0, 0);
    half.userData.key = 'S'; keys.S = [half];
    half.scale.x = 1; list.push(half);
    // field lines as tubes
    for (let i = 0; i < 7; i++) {
      const y = -1.2 + i * 0.4;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.5, y * 0.3, 0),
        new THREE.Vector3(0, y, 0.9),
        new THREE.Vector3(1.5, y * 0.3, 0));
      const t = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.022, 6, false), mat(0x38bdf8, { roughness: 0.4 }));
      t.userData.key = 'field' + i;
      (keys['field' + i] = keys['field' + i] || []).push(t);
      list.push(t);
    }
  } else {
    const sol = cyl(0.55, 0.55, 3.2, 0xd97706, 0, 0, 0, 'x');
    sol.userData.key = 'solenoid'; keys.solenoid = [sol]; list.push(sol);
    for (let i = 0; i < 6; i++) {
      const x = -1.4 + i * 0.56;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 8, 24), mat(0xfbbf24));
      ring.position.set(x, 0, 0);
      ring.rotation.y = Math.PI / 2;
      ring.userData.key = 'turn' + (i + 1);
      (keys['turn' + (i + 1)] = keys['turn' + (i + 1)] || []).push(ring);
      list.push(ring);
    }
    for (let i = 0; i < 5; i++) {
      const y = -0.4 + i * 0.2;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-2.6, y, 0),
        new THREE.Vector3(0, y * 3.4, 0),
        new THREE.Vector3(2.6, y, 0));
      const t = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.022, 6, false), mat(0x38bdf8));
      t.userData.key = 'field' + i;
      (keys['field' + i] = keys['field' + i] || []).push(t);
      list.push(t);
    }
  }
  return finish(s, list, keys);
}

/* ================= BIOLOGY (procedural) ================= */

export function bio(name) {
  const s = sceneBase();
  const keys = {};
  const list = [];
  function reg(m, key) { m.userData.key = key; (keys[key] = keys[key] || []).push(m); list.push(m); }

  if (name === 'amoeba') {
    const body = sph(1.0, 0x86efac, 0, 0, 0, 1.25, 1, 0.9);
    reg(body, 'cell');
    const nuc = sph(0.3, 0x166534, 0.2, 0.1, 0.2);
    reg(nuc, 'nucleus');
    [-0.7, 0.6, -0.3].forEach(function (x, i) {
      const v = sph(0.22, 0xbbf7d0, x, -0.5 + i * 0.35, 0.3);
      reg(v, 'vacuole');
    });
    const food = sph(0.25, 0xf59e0b, -0.5, 0.3, -0.4);
    reg(food, 'food');
    const ps = tube([[-1.8, 0.4, 0.5], [-1.2, 0.5, 0.4], [-0.9, 0.2, 0.1]], 0x4ade80, 0.16);
    reg(ps, 'pseudopodia');
  } else if (name === 'leaf') {
    const leaf = sph(1.4, 0x22c55e, 0, 0, 0, 1.5, 0.22, 0.7);
    reg(leaf, 'leaf');
    const vein = tube([[0, 0.3, 0], [0, 0.1, 0], [0, -0.3, 0]], 0x86efac, 0.05);
    reg(vein, 'vein');
    for (let i = 0; i < 6; i++) {
      const v = line([0, 0.28, 0], [0.5 - i * 0.2, 0.1 - i * 0.06, 0], 0x86efac, 0.02);
      reg(v, 'vein');
    }
  } else if (name === 'stomata') {
    const g1 = sph(0.5, 0x4ade80, -0.55, 0, 0, 1, 0.7, 1);
    reg(g1, 'guard1');
    const g2 = sph(0.5, 0x4ade80, 0.55, 0, 0, 1, 0.7, 1);
    reg(g2, 'guard2');
    const pore = sph(0.22, 0x0f172a, 0, 0, 0, 1.4, 0.6, 1);
    reg(pore, 'pore');
    const e1 = sph(0.28, 0x86efac, -1.3, -0.4, 0);
    reg(e1, 'epidermis');
    const e2 = sph(0.28, 0x86efac, 1.3, 0.4, 0);
    reg(e2, 'epidermis');
  } else if (name === 'nephron') {
    const glom = sph(0.45, 0xef4444, 0, 0.9, 0);
    reg(glom, 'glomerulus');
    const bow = sph(0.62, 0xfca5a5, 0, 0.9, 0, 1, 1, 1);
    bow.material = glassMat(0xfca5a5);
    reg(bow, 'bowman');
    const tub = tube([[0.35, 0.85, 0], [0.8, 0.2, 0.2], [0.2, -0.5, -0.2], [0.7, -1.0, 0.2], [0.2, -1.4, 0]], 0xfbbf24, 0.09);
    reg(tub, 'tubule');
    const cap = tube([[0.8, 0.2, 0.2], [1.4, 0.5, 0.3]], 0x38bdf8, 0.04);
    reg(cap, 'capillary');
    const art = line([-1.4, 1.2, 0], [0, 0.9, 0], 0xef4444, 0.05);
    reg(art, 'arteriole');
  } else if (name === 'neuron') {
    const soma = sph(0.55, 0xf472b6, 0, 0, 0);
    reg(soma, 'soma');
    const nuc = sph(0.2, 0xbe185d, 0, 0, 0);
    reg(nuc, 'nucleus');
    const axon = tube([[0.4, 0.1, 0], [1.4, 0.2, 0], [2.4, 0.1, 0]], 0xfbbf24, 0.12);
    reg(axon, 'axon');
    for (let i = 0; i < 5; i++) {
      const d = tube([[-0.4, 0.2, 0], [-0.9, 0.5 - i * 0.25, 0.15]], 0xfda4af, 0.05);
      reg(d, 'dendrite');
    }
    const term = sph(0.16, 0x38bdf8, 2.6, 0.1, 0);
    reg(term, 'terminal');
  } else if (name === 'reflex') {
    const cord = cyl(0.3, 0.3, 3.0, 0xfbbf24, 0, 0, 0, 'y');
    reg(cord, 'cord');
    const sense = sph(0.28, 0xef4444, 2.4, 1.4, 0);
    reg(sense, 'receptor');
    const aff = tube([[2.4, 1.4, 0], [1.0, 0.6, 0], [0.1, 0.4, 0]], 0x38bdf8, 0.06);
    reg(aff, 'afferent');
    const eff = tube([[0.1, -0.4, 0], [1.2, -1.0, 0], [2.4, -1.4, 0]], 0xf97316, 0.06);
    reg(eff, 'efferent');
    const mus = sph(0.4, 0xa855f7, 2.6, -1.5, 0, 1.3, 0.6, 0.6);
    reg(mus, 'muscle');
    const brain = sph(0.5, 0xf472b6, 0, 1.9, 0);
    reg(brain, 'brain');
  } else if (name === 'fission' || name === 'budding' || name === 'spore') {
    const parent = sph(0.9, 0x86efac, -0.7, 0, 0, 1.1, 1, 1);
    reg(parent, 'parent');
    const nuc = sph(0.28, 0x166534, -0.7, 0, 0);
    reg(nuc, 'nucleus');
    if (name === 'fission') {
      const d1 = sph(0.55, 0x4ade80, 0.5, 0.4, 0, 1.1, 1, 1);
      const d2 = sph(0.55, 0x4ade80, 0.5, -0.4, 0, 1.1, 1, 1);
      reg(d1, 'daughter'); reg(d2, 'daughter');
    } else if (name === 'budding') {
      const bud = sph(0.45, 0x4ade80, 0.6, 0.5, 0);
      reg(bud, 'bud');
      const bn = sph(0.16, 0x166534, 0.6, 0.5, 0);
      reg(bn, 'budnucleus');
    } else {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const sp = sph(0.16, 0xa855f7, Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0);
        reg(sp, 'spore');
      }
      const sph2 = cyl(0.05, 0.05, 1.2, 0x86efac, 0, 0.9, 0);
      reg(sph2, 'hypha');
    }
  } else if (name === 'flower') {
    const stem = cyl(0.08, 0.1, 2.4, 0x22c55e, 0, -1.6, 0);
    reg(stem, 'stem');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = sph(0.5, i % 2 ? 0xec4899 : 0xfbcfe8, Math.cos(a) * 0.72, 0.18, Math.sin(a) * 0.72, 1.7, 0.3, 1.1);
      p.rotation.y = -a;
      reg(p, 'petal');
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const sep = sph(0.28, 0x16a34a, Math.cos(a) * 0.55, 0.02, Math.sin(a) * 0.55, 1.6, 0.25, 0.9);
      sep.rotation.y = -a;
      reg(sep, 'sepal');
    }
    const ov = sph(0.45, 0xfbbf24, 0, -0.2, 0, 1, 1.4, 1);
    reg(ov, 'ovary');
    const st = cyl(0.04, 0.04, 0.9, 0x86efac, 0, 0.5, 0);
    reg(st, 'style');
    const sg = sph(0.18, 0xef4444, 0, 1.0, 0);
    reg(sg, 'stigma');
    const an = sph(0.16, 0xf59e0b, 0.5, 0.5, 0);
    reg(an, 'anther');
  } else if (name === 'pollen') {
    const st = sph(0.4, 0xef4444, 0, 0.9, 0);
    reg(st, 'stigma');
    const sty = cyl(0.12, 0.14, 1.6, 0x86efac, 0, 0, 0);
    reg(sty, 'style');
    const ov = sph(0.5, 0xfbbf24, 0, -1.0, 0);
    reg(ov, 'ovary');
    const pg = sph(0.16, 0xf59e0b, 0.3, 1.15, 0.2);
    reg(pg, 'pollengrain');
    const ptube = tube([[0.3, 1.1, 0.2], [0.2, 0.4, 0.15], [0.1, -0.4, 0.1]], 0xfbbf24, 0.05);
    reg(ptube, 'pollentube');
  } else if (name === 'chromosomes') {
    const pair = [
      ['X1', 0xef4444, -0.9, 0.9], ['X2', 0xef4444, -0.9, -0.9],
      ['Y', 0x3b82f6, 0.9, 0.9], ['X3', 0xef4444, 0.9, -0.9]
    ];
    pair.forEach(function (p) {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.13, 10, 20), mat(p[1]));
      c.position.set(p[2], p[3], 0);
      c.rotation.z = Math.PI / 4;
      reg(c, p[0]);
    });
  } else if (name === 'eye') {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.28, side: THREE.DoubleSide, envMapIntensity: 0.7 }));
    reg(ball, 'sclera');
    const ret = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 20, -Math.PI / 2, Math.PI, 0, Math.PI * 2),
      mat(0xc2410c, { roughness: 0.45, side: THREE.BackSide }));
    reg(ret, 'retina');
    const iris = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.15, 14, 36), mat(0x1d4ed8, { roughness: 0.3 }));
    iris.rotation.y = Math.PI / 2; iris.position.x = 0.86; reg(iris, 'iris');
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshBasicMaterial({ color: 0x0b0b0b }));
    pupil.rotation.y = Math.PI / 2; pupil.position.x = 0.985; reg(pupil, 'pupil');
    const cornea = new THREE.Mesh(new THREE.SphereGeometry(1.04, 32, 20, -Math.PI / 2 - 0.4, 0.8, 1.1, 0.85), glassMat(0xbfe3ff));
    reg(cornea, 'cornea');
    const lens = sph(0.3, 0xfde68a, 0.58, 0, 0, 0.55, 1, 1);
    lens.material = new THREE.MeshPhysicalMaterial({ color: 0xfde68a, roughness: 0.05, transmission: 0.7, thickness: 0.4, transparent: true, opacity: 0.75 });
    reg(lens, 'lens');
    const optic = cyl(0.2, 0.26, 1.1, 0xf59e0b, -1.35, 0, 0);
    optic.rotation.z = Math.PI / 2; reg(optic, 'optic');
  } else {
    const b = sph(0.9, 0x86efac, 0, 0, 0);
    reg(b, 'cell');
  }
  return finish(s, list, keys);
}
