import * as THREE from 'three';
import { OrganId } from '../data/reprocareData';
import { createLightRayTexture, createRadialGlowTexture } from './webglUtils';

export interface OrganMaterials {
  outer: THREE.MeshPhysicalMaterial;
  inner: THREE.MeshStandardMaterial;
  baseOuterOpacity: number;
  baseOuterEmissive: number;
  baseInnerEmissive: number;
}

export interface AnatomySystem {
  root: THREE.Group;
  organGroups: Record<OrganId, THREE.Group>;
  organMaterials: Record<OrganId, OrganMaterials>;
  raycastTargets: THREE.Mesh[];
  ambientParticles: THREE.Points;
  hormoneParticles: THREE.Points;
  lightRaysGroup: THREE.Group;
  update: (
    time: number,
    dt: number,
    focusMap: Record<OrganId, number>,
    hormoneIntensity: number,
    animateMotion: boolean
  ) => void;
  dispose: () => void;
}

/**
 * Generates a smooth variable-radius organic lofted tube along a 3D spline.
 * Used for anatomically tapered fallopian tubes (isthmus -> ampulla -> infundibulum)
 * and delicate sculpted fimbriae fronds.
 */
function createVariableTubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radialSegments: number,
  radiusFn: (t: number, angle: number) => number,
  closedEnds = false
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const vertex = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, P);
    N.copy(frames.normals[i]);
    B.copy(frames.binormals[i]);

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const r = radiusFn(t, v);
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      vertex.x = P.x + r * (cos * N.x + sin * B.x);
      vertex.y = P.y + r * (cos * N.y + sin * B.y);
      vertex.z = P.z + r * (cos * N.z + sin * B.z);

      positions.push(vertex.x, vertex.y, vertex.z);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  if (closedEnds) {
    // Cap start
    const startCenterIdx = positions.length / 3;
    const pStart = curve.getPointAt(0);
    positions.push(pStart.x, pStart.y, pStart.z);
    uvs.push(0, 0.5);
    for (let j = 0; j < radialSegments; j++) {
      indices.push(startCenterIdx, j + 1, j);
    }
    // Cap end
    const endCenterIdx = positions.length / 3;
    const pEnd = curve.getPointAt(1);
    positions.push(pEnd.x, pEnd.y, pEnd.z);
    uvs.push(1, 0.5);
    const ringOffset = tubularSegments * (radialSegments + 1);
    for (let j = 0; j < radialSegments; j++) {
      indices.push(endCenterIdx, ringOffset + j, ringOffset + j + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sculpted, pear-shaped, anteroposteriorly flattened uterine body
 * with smooth fundus dome and subtle bilateral cornual flares.
 */
function createUterusBodyGeometry(scaleFactor = 1.0, detailMultiplier = 1): THREE.BufferGeometry {
  const segU = Math.round(48 * detailMultiplier);
  const segV = Math.round(42 * detailMultiplier);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segV; i++) {
    const v = i / segV; // 0 = bottom (isthmus), 1 = top (fundus apex)
    const y = THREE.MathUtils.lerp(-0.92, 1.12, v) * scaleFactor;

    // Base profile width from narrow isthmus to broad corpus to rounded fundus
    let rx = 0.25;
    if (v < 0.25) {
      const k = v / 0.25;
      rx = THREE.MathUtils.lerp(0.24, 0.42, k * k * (3 - 2 * k));
    } else if (v < 0.78) {
      const k = (v - 0.25) / 0.53;
      rx = THREE.MathUtils.lerp(0.42, 0.94, Math.sin(k * Math.PI * 0.5));
    } else {
      const k = (v - 0.78) / 0.22;
      rx = 0.94 * Math.cos(k * Math.PI * 0.5);
    }

    // Anterior-posterior thickness is flatter than lateral width (realistic pear flattening)
    let rz = rx * 0.58;
    if (v > 0.78) {
      const k = (v - 0.78) / 0.22;
      rz = Math.max(0.01, rx * 0.58 * (1 - 0.15 * k));
    }

    // Slight natural anteflexion curve forward
    const zOffset = Math.pow(v, 1.8) * 0.16 * scaleFactor;

    for (let j = 0; j <= segU; j++) {
      const u = j / segU;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      // Subtle bilateral cornual prominence at upper lateral shoulders (v ~ 0.65-0.84)
      const cornualBand = Math.exp(-Math.pow((v - 0.74) / 0.13, 2));
      const lateralWeight = Math.pow(Math.abs(cosT), 2.5);
      const cornuFlare = 1 + 0.18 * cornualBand * lateralWeight;

      // Very gentle dome flattening at very top center of fundus
      const fundusDip = v > 0.92 ? (1 - (1 - Math.abs(cosT)) * 0.04 * ((v - 0.92) / 0.08)) : 1;

      const x = rx * scaleFactor * cornuFlare * cosT;
      const z = rz * scaleFactor * sinT + zOffset;
      const py = y * fundusDip;

      positions.push(x, py, z);
      uvs.push(u, v);
    }
  }

  for (let i = 0; i < segV; i++) {
    for (let j = 0; j < segU; j++) {
      const a = i * (segU + 1) + j;
      const b = (i + 1) * (segU + 1) + j;
      const c = (i + 1) * (segU + 1) + (j + 1);
      const d = i * (segU + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sculpted almond-shaped ovary with organic cortical undulations.
 */
function createOvaryGeometry(detailMultiplier = 1): THREE.BufferGeometry {
  const seg = Math.round(32 * detailMultiplier);
  const geo = new THREE.SphereGeometry(0.32, seg, seg);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 1.28; // almond elongation
    let y = pos.getY(i) * 0.84;
    let z = pos.getZ(i) * 0.68;

    // Subtle organic follicular surface undulation
    const ripple =
      1 +
      0.055 * Math.sin(x * 9.5 + y * 5.0) * Math.cos(z * 8.0) +
      0.03 * Math.sin(y * 12.0);
    x *= ripple;
    y *= ripple;
    z *= ripple;
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function createReproductiveAnatomy(options: {
  isSoftwareGl: boolean;
  isMobile: boolean;
}): AnatomySystem {
  const { isSoftwareGl, isMobile } = options;
  const detail = isMobile ? 0.7 : 1.0;

  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const root = new THREE.Group();
  root.name = 'ReproCareAnatomyRoot';

  const makeOrganMaterial = (opts: {
    color: number;
    emissive: number;
    emissiveIntensity: number;
    innerColor: number;
    innerEmissive: number;
    innerEmissiveIntensity: number;
    roughness?: number;
    transmission?: number;
    opacity?: number;
  }): OrganMaterials => {
    const baseOpacity = isSoftwareGl ? (opts.opacity ?? 0.68) : (opts.opacity ?? 0.94);
    const outer = track(
      new THREE.MeshPhysicalMaterial({
        color: opts.color,
        emissive: opts.emissive,
        emissiveIntensity: opts.emissiveIntensity,
        roughness: opts.roughness ?? 0.17,
        metalness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.12,
        ior: 1.48,
        thickness: 1.4,
        attenuationColor: new THREE.Color(0x47081a),
        attenuationDistance: 1.6,
        sheen: 0.7,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(0xf0b1c1),
        transmission: isSoftwareGl ? 0 : (opts.transmission ?? 0.68),
        transparent: true,
        opacity: baseOpacity,
        depthWrite: false,
      })
    );

    const inner = track(
      new THREE.MeshStandardMaterial({
        color: opts.innerColor,
        emissive: opts.innerEmissive,
        emissiveIntensity: opts.innerEmissiveIntensity,
        roughness: 0.35,
        metalness: 0.0,
        transparent: true,
        opacity: 0.72,
      })
    );

    return {
      outer,
      inner,
      baseOuterOpacity: baseOpacity,
      baseOuterEmissive: opts.emissiveIntensity,
      baseInnerEmissive: opts.innerEmissiveIntensity,
    };
  };

  const organMaterials: Record<OrganId, OrganMaterials> = {
    uterus: makeOrganMaterial({
      color: 0x9b183e,
      emissive: 0x5c0a22,
      emissiveIntensity: 0.42,
      innerColor: 0xf0b1c1,
      innerEmissive: 0xd97893,
      innerEmissiveIntensity: 1.15,
      transmission: 0.72,
    }),
    cervix: makeOrganMaterial({
      color: 0x851436,
      emissive: 0x4d091d,
      emissiveIntensity: 0.36,
      innerColor: 0xf0b1c1,
      innerEmissive: 0xc95a7a,
      innerEmissiveIntensity: 0.9,
      roughness: 0.22,
      transmission: 0.62,
    }),
    'right-tube': makeOrganMaterial({
      color: 0xa32248,
      emissive: 0x660e29,
      emissiveIntensity: 0.4,
      innerColor: 0xf0b1c1,
      innerEmissive: 0xd97893,
      innerEmissiveIntensity: 0.95,
      transmission: 0.66,
    }),
    'left-tube': makeOrganMaterial({
      color: 0xa32248,
      emissive: 0x660e29,
      emissiveIntensity: 0.4,
      innerColor: 0xf0b1c1,
      innerEmissive: 0xd97893,
      innerEmissiveIntensity: 0.95,
      transmission: 0.66,
    }),
    'right-ovary': makeOrganMaterial({
      color: 0xc94f72,
      emissive: 0x731230,
      emissiveIntensity: 0.5,
      innerColor: 0xf7e9ed,
      innerEmissive: 0xf0b1c1,
      innerEmissiveIntensity: 1.45,
      roughness: 0.16,
      transmission: 0.7,
    }),
    'left-ovary': makeOrganMaterial({
      color: 0xc94f72,
      emissive: 0x731230,
      emissiveIntensity: 0.5,
      innerColor: 0xf7e9ed,
      innerEmissive: 0xf0b1c1,
      innerEmissiveIntensity: 1.45,
      roughness: 0.16,
      transmission: 0.7,
    }),
    fimbriae: makeOrganMaterial({
      color: 0xd97893,
      emissive: 0x8c1638,
      emissiveIntensity: 0.55,
      innerColor: 0xf7e9ed,
      innerEmissive: 0xf0b1c1,
      innerEmissiveIntensity: 1.2,
      roughness: 0.24,
      transmission: 0.45,
      opacity: 0.9,
    }),
  };

  const organGroups: Record<OrganId, THREE.Group> = {
    uterus: new THREE.Group(),
    cervix: new THREE.Group(),
    'right-tube': new THREE.Group(),
    'left-tube': new THREE.Group(),
    'right-ovary': new THREE.Group(),
    'left-ovary': new THREE.Group(),
    fimbriae: new THREE.Group(),
  };

  const raycastTargets: THREE.Mesh[] = [];
  const registerMesh = (mesh: THREE.Mesh, organId: OrganId, renderOrder = 2) => {
    mesh.userData.organId = organId;
    mesh.layers.enable(1);
    mesh.renderOrder = renderOrder;
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    raycastTargets.push(mesh);
    return mesh;
  };

  // =========================================================
  // 1. UTERUS (Outer glass myometrium + Inner luminous endometrium)
  // =========================================================
  const uterusOuterGeo = track(createUterusBodyGeometry(1.0, detail));
  const uterusOuterMesh = new THREE.Mesh(uterusOuterGeo, organMaterials.uterus.outer);
  registerMesh(uterusOuterMesh, 'uterus', 3);
  organGroups.uterus.add(uterusOuterMesh);

  // Inner endometrial cavity (inverted triangular glowing core)
  const uterusInnerGeo = track(createUterusBodyGeometry(0.62, detail));
  uterusInnerGeo.scale(0.84, 0.88, 0.52);
  uterusInnerGeo.translate(0, 0.08, 0.02);
  const uterusInnerMesh = new THREE.Mesh(uterusInnerGeo, organMaterials.uterus.inner);
  uterusInnerMesh.renderOrder = 1;
  uterusInnerMesh.userData.organId = 'uterus';
  organGroups.uterus.add(uterusInnerMesh);

  root.add(organGroups.uterus);

  // =========================================================
  // 2. CERVIX (Sculpted cylindrical-conical neck + endocervical canal)
  // =========================================================
  const cervixPoints = [
    new THREE.Vector2(0.01, -1.86),
    new THREE.Vector2(0.18, -1.85),
    new THREE.Vector2(0.32, -1.78),
    new THREE.Vector2(0.36, -1.62),
    new THREE.Vector2(0.34, -1.4),
    new THREE.Vector2(0.31, -1.16),
    new THREE.Vector2(0.27, -0.94),
    new THREE.Vector2(0.24, -0.84),
  ];
  const cervixGeo = track(new THREE.LatheGeometry(cervixPoints, Math.round(40 * detail)));
  cervixGeo.scale(1.0, 1.0, 0.85);
  const cervixMesh = new THREE.Mesh(cervixGeo, organMaterials.cervix.outer);
  registerMesh(cervixMesh, 'cervix', 3);
  organGroups.cervix.add(cervixMesh);

  // Inner endocervical canal filament
  const canalCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.82, 0),
    new THREE.Vector3(0, -1.35, 0.02),
    new THREE.Vector3(0, -0.82, 0.03),
  ]);
  const canalGeo = track(
    createVariableTubeGeometry(canalCurve, 24, 14, (t) => 0.055 + Math.sin(t * Math.PI) * 0.025, true)
  );
  const canalMesh = new THREE.Mesh(canalGeo, organMaterials.cervix.inner);
  canalMesh.renderOrder = 1;
  canalMesh.userData.organId = 'cervix';
  organGroups.cervix.add(canalMesh);

  // Subtle vaginal fornix collar around distal cervix
  const fornixPoints = [
    new THREE.Vector2(0.35, -1.78),
    new THREE.Vector2(0.45, -1.94),
    new THREE.Vector2(0.42, -2.06),
    new THREE.Vector2(0.37, -2.06),
    new THREE.Vector2(0.38, -1.88),
  ];
  const fornixGeo = track(new THREE.LatheGeometry(fornixPoints, Math.round(36 * detail)));
  fornixGeo.scale(1.0, 1.0, 0.84);
  const fornixMesh = new THREE.Mesh(fornixGeo, organMaterials.cervix.outer);
  registerMesh(fornixMesh, 'cervix', 3);
  organGroups.cervix.add(fornixMesh);

  root.add(organGroups.cervix);

  // =========================================================
  // 3. FALLOPIAN TUBES & FIMBRIAE (Bilateral mirror construction)
  // =========================================================
  const buildTubeAndFimbriae = (side: 'left' | 'right') => {
    // Anatomical convention: viewer's left is anatomical right (-X), viewer's right is anatomical left (+X)
    const dir = side === 'right' ? -1 : 1;
    const tubeId: OrganId = side === 'right' ? 'right-tube' : 'left-tube';
    const tubeMats = organMaterials[tubeId];

    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dir * 0.72, 0.62, 0.08), // Uterine cornu origin
      new THREE.Vector3(dir * 1.18, 0.88, 0.05), // Isthmus lateral climb
      new THREE.Vector3(dir * 1.72, 1.02, -0.08), // Superior arch
      new THREE.Vector3(dir * 2.15, 0.82, -0.22), // Ampulla curve
      new THREE.Vector3(dir * 2.28, 0.44, -0.24), // Descending ampulla
      new THREE.Vector3(dir * 2.04, 0.25, -0.18), // Infundibulum mouth opening toward ovary
    ]);

    const tubeRadius = (t: number) => {
      // Narrow isthmus (0.08) -> widening ampulla (0.16) -> flared infundibulum trumpet (0.24)
      if (t < 0.35) return THREE.MathUtils.lerp(0.085, 0.11, t / 0.35);
      if (t < 0.82) return THREE.MathUtils.lerp(0.11, 0.165, (t - 0.35) / 0.47);
      return THREE.MathUtils.lerp(0.165, 0.245, Math.pow((t - 0.82) / 0.18, 1.3));
    };

    const tubeGeo = track(
      createVariableTubeGeometry(
        tubeCurve,
        Math.round(52 * detail),
        Math.round(20 * detail),
        tubeRadius,
        false
      )
    );
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMats.outer);
    registerMesh(tubeMesh, tubeId, 3);
    organGroups[tubeId].add(tubeMesh);

    // Inner glowing tubal lumen
    const lumenGeo = track(
      createVariableTubeGeometry(
        tubeCurve,
        Math.round(42 * detail),
        Math.round(12 * detail),
        (t) => tubeRadius(t) * 0.38,
        true
      )
    );
    const lumenMesh = new THREE.Mesh(lumenGeo, tubeMats.inner);
    lumenMesh.renderOrder = 1;
    lumenMesh.userData.organId = tubeId;
    organGroups[tubeId].add(lumenMesh);

    root.add(organGroups[tubeId]);

    // Delicate Fimbriae fronds radiating from infundibulum end
    const endPoint = tubeCurve.getPointAt(1);
    const endTangent = tubeCurve.getTangentAt(1).normalize();
    const normalRef = new THREE.Vector3(0, 0, 1);
    const axisU = new THREE.Vector3().crossVectors(endTangent, normalRef).normalize();
    const axisV = new THREE.Vector3().crossVectors(endTangent, axisU).normalize();

    const frondCount = isMobile ? 8 : 11;
    for (let k = 0; k < frondCount; k++) {
      const angle = (k / frondCount) * Math.PI * 2;
      const radialDir = new THREE.Vector3()
        .addScaledVector(axisU, Math.cos(angle))
        .addScaledVector(axisV, Math.sin(angle))
        .normalize();

      const basePt = endPoint.clone().addScaledVector(radialDir, 0.19);
      const midPt = basePt
        .clone()
        .addScaledVector(endTangent, 0.16)
        .addScaledVector(radialDir, 0.11 + 0.04 * Math.sin(k * 1.9));
      const tipPt = midPt
        .clone()
        .addScaledVector(endTangent, 0.14)
        .addScaledVector(radialDir, -0.05)
        .add(new THREE.Vector3(-dir * 0.07, -0.08, 0.02));

      const frondCurve = new THREE.CatmullRomCurve3([basePt, midPt, tipPt]);
      const frondGeo = track(
        createVariableTubeGeometry(
          frondCurve,
          14,
          8,
          (t) => THREE.MathUtils.lerp(0.042, 0.008, Math.pow(t, 0.85)),
          true
        )
      );
      const frondMesh = new THREE.Mesh(frondGeo, organMaterials.fimbriae.outer);
      registerMesh(frondMesh, 'fimbriae', 4);
      organGroups.fimbriae.add(frondMesh);

      // Luminous fimbria tip bead
      const tipBeadGeo = track(new THREE.SphereGeometry(0.018, 8, 8));
      const tipBead = new THREE.Mesh(tipBeadGeo, organMaterials.fimbriae.inner);
      tipBead.position.copy(tipPt);
      tipBead.userData.organId = 'fimbriae';
      tipBead.renderOrder = 2;
      organGroups.fimbriae.add(tipBead);
    }
  };

  buildTubeAndFimbriae('right');
  buildTubeAndFimbriae('left');
  root.add(organGroups.fimbriae);

  // =========================================================
  // 4. OVARIES (Almond glass cortex + internal glowing follicles + ligaments)
  // =========================================================
  const buildOvary = (side: 'left' | 'right') => {
    const dir = side === 'right' ? -1 : 1;
    const ovaryId: OrganId = side === 'right' ? 'right-ovary' : 'left-ovary';
    const mats = organMaterials[ovaryId];
    const group = organGroups[ovaryId];

    const ovaryCenter = new THREE.Vector3(dir * 1.72, -0.04, -0.18);

    const ovaryGeo = track(createOvaryGeometry(detail));
    const ovaryMesh = new THREE.Mesh(ovaryGeo, mats.outer);
    ovaryMesh.position.copy(ovaryCenter);
    ovaryMesh.rotation.set(0.15, dir * 0.25, dir * -0.22);
    registerMesh(ovaryMesh, ovaryId, 3);
    group.add(ovaryMesh);

    // Internal glowing ovarian follicles (5 developmental stages inside cortex)
    const follicleSpecs = [
      { offset: [0.12 * dir, 0.05, 0.04], radius: 0.095 },
      { offset: [-0.14 * dir, 0.08, -0.02], radius: 0.068 },
      { offset: [0.02 * dir, -0.09, 0.05], radius: 0.055 },
      { offset: [-0.08 * dir, -0.06, -0.05], radius: 0.042 },
      { offset: [0.18 * dir, -0.04, -0.03], radius: 0.048 },
    ];
    for (const f of follicleSpecs) {
      const fGeo = track(new THREE.SphereGeometry(f.radius, 14, 14));
      const fMesh = new THREE.Mesh(fGeo, mats.inner);
      fMesh.position.set(
        ovaryCenter.x + f.offset[0],
        ovaryCenter.y + f.offset[1],
        ovaryCenter.z + f.offset[2]
      );
      fMesh.renderOrder = 1;
      fMesh.userData.organId = ovaryId;
      group.add(fMesh);
    }

    // Ovarian ligament tethering ovary medially to the uterine cornu
    const ligCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dir * 0.78, 0.36, 0.04),
      new THREE.Vector3(dir * 1.12, 0.16, -0.06),
      new THREE.Vector3(dir * 1.38, 0.02, -0.15),
    ]);
    const ligGeo = track(
      createVariableTubeGeometry(ligCurve, 20, 10, (t) => 0.032 - Math.sin(t * Math.PI) * 0.008, true)
    );
    const ligMesh = new THREE.Mesh(ligGeo, mats.outer);
    ligMesh.userData.organId = ovaryId;
    ligMesh.renderOrder = 2;
    group.add(ligMesh);

    root.add(group);
  };

  buildOvary('right');
  buildOvary('left');

  // =========================================================
  // 5. SUBTLE VOLUMETRIC LIGHT RAYS (Additive translucent cones behind sculpture)
  // =========================================================
  const lightRaysGroup = new THREE.Group();
  const rayTexture = track(createLightRayTexture());
  const rayMat = track(
    new THREE.MeshBasicMaterial({
      map: rayTexture,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  const rayConfigs = [
    { pos: [-0.9, 2.2, -1.8], rotZ: -0.22, scale: [1.6, 5.8, 1] },
    { pos: [0.4, 2.5, -2.2], rotZ: 0.14, scale: [2.1, 6.4, 1] },
    { pos: [1.3, 2.1, -1.9], rotZ: 0.28, scale: [1.3, 5.2, 1] },
  ];
  for (const rc of rayConfigs) {
    const planeGeo = track(new THREE.PlaneGeometry(1, 1));
    const rayMesh = new THREE.Mesh(planeGeo, rayMat);
    rayMesh.position.set(rc.pos[0], rc.pos[1], rc.pos[2]);
    rayMesh.rotation.z = rc.rotZ;
    rayMesh.scale.set(rc.scale[0], rc.scale[1], rc.scale[2]);
    lightRaysGroup.add(rayMesh);
  }
  root.add(lightRaysGroup);

  // =========================================================
  // 6. FLOATING BIOLOGICAL & HORMONAL PARTICLES
  // =========================================================
  const glowTex = track(createRadialGlowTexture(128));

  const ambientCount = isMobile ? 90 : 180;
  const ambientPositions = new Float32Array(ambientCount * 3);
  const ambientBase = new Float32Array(ambientCount * 3);
  for (let i = 0; i < ambientCount; i++) {
    const x = (Math.random() - 0.5) * 9.5;
    const y = (Math.random() - 0.5) * 6.5;
    const z = (Math.random() - 0.5) * 5.0 - 0.5;
    ambientPositions[i * 3] = x;
    ambientPositions[i * 3 + 1] = y;
    ambientPositions[i * 3 + 2] = z;
    ambientBase[i * 3] = x;
    ambientBase[i * 3 + 1] = y;
    ambientBase[i * 3 + 2] = z;
  }
  const ambientGeo = track(new THREE.BufferGeometry());
  ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
  const ambientMat = track(
    new THREE.PointsMaterial({
      size: 0.085,
      map: glowTex,
      color: new THREE.Color(0xf0b1c1),
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  const ambientParticles = new THREE.Points(ambientGeo, ambientMat);
  ambientParticles.frustumCulled = false;
  root.add(ambientParticles);

  // Hormone-inspired particles orbiting near the ovaries
  const hormoneCount = isMobile ? 60 : 120;
  const hormonePositions = new Float32Array(hormoneCount * 3);
  const hormoneSeeds = new Float32Array(hormoneCount * 4); // angle, radius, yOffset, side(-1/1)
  for (let i = 0; i < hormoneCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.42 + Math.random() * 0.72;
    const yOff = (Math.random() - 0.5) * 0.85;
    hormoneSeeds[i * 4] = angle;
    hormoneSeeds[i * 4 + 1] = radius;
    hormoneSeeds[i * 4 + 2] = yOff;
    hormoneSeeds[i * 4 + 3] = side;

    hormonePositions[i * 3] = side * 1.72 + Math.cos(angle) * radius;
    hormonePositions[i * 3 + 1] = -0.04 + yOff;
    hormonePositions[i * 3 + 2] = -0.18 + Math.sin(angle) * radius * 0.7;
  }
  const hormoneGeo = track(new THREE.BufferGeometry());
  hormoneGeo.setAttribute('position', new THREE.BufferAttribute(hormonePositions, 3));
  const hormoneMat = track(
    new THREE.PointsMaterial({
      size: 0.11,
      map: glowTex,
      color: new THREE.Color(0xf7e9ed),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  const hormoneParticles = new THREE.Points(hormoneGeo, hormoneMat);
  hormoneParticles.frustumCulled = false;
  root.add(hormoneParticles);

  // Track smoothed highlight values per organ
  const currentWeights: Record<OrganId, number> = {
    uterus: 1,
    cervix: 1,
    'right-tube': 1,
    'left-tube': 1,
    'right-ovary': 1,
    'left-ovary': 1,
    fimbriae: 1,
  };

  const organKeys: OrganId[] = [
    'uterus',
    'cervix',
    'right-tube',
    'left-tube',
    'right-ovary',
    'left-ovary',
    'fimbriae',
  ];

  const update = (
    time: number,
    dt: number,
    focusMap: Record<OrganId, number>,
    hormoneIntensity: number,
    animateMotion: boolean
  ) => {
    const safeDt = Math.min(dt, 0.05);

    // Subtle organic breathing motion
    if (animateMotion) {
      const breath = 1 + Math.sin(time * 1.15) * 0.014;
      organGroups.uterus.scale.set(breath, 1 + Math.sin(time * 1.15 - 0.4) * 0.01, breath);
      const ovaryPulse = 1 + Math.sin(time * 1.45) * 0.018;
      organGroups['right-ovary'].scale.setScalar(ovaryPulse);
      organGroups['left-ovary'].scale.setScalar(ovaryPulse);
      organGroups.fimbriae.rotation.x = Math.sin(time * 0.9) * 0.018;
    }

    // Damped organ illumination / dimming transitions
    for (const id of organKeys) {
      const target = focusMap[id] ?? 1;
      const w = THREE.MathUtils.damp(currentWeights[id], target, 5.5, safeDt);
      currentWeights[id] = w;

      const mat = organMaterials[id];
      // w = 1.0 (normal), w > 1.0 (highlighted ~ 1.6), w < 1.0 (dimmed ~ 0.25)
      const opacityFactor = THREE.MathUtils.clamp(THREE.MathUtils.lerp(0.24, 1.0, w), 0.18, 1.0);
      mat.outer.opacity = mat.baseOuterOpacity * opacityFactor;
      mat.outer.emissiveIntensity = mat.baseOuterEmissive * (0.25 + w * 0.95);
      mat.inner.opacity = THREE.MathUtils.clamp(0.18 + w * 0.56, 0.14, 0.95);
      mat.inner.emissiveIntensity = mat.baseInnerEmissive * (0.2 + w * 1.1);
    }

    // Ambient micro-particles drift
    if (animateMotion) {
      const ambPos = ambientGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < ambientCount; i++) {
        const bx = ambientBase[i * 3];
        const by = ambientBase[i * 3 + 1];
        const bz = ambientBase[i * 3 + 2];
        ambPos.setXYZ(
          i,
          bx + Math.sin(time * 0.35 + i * 0.7) * 0.18,
          by + Math.cos(time * 0.28 + i * 1.1) * 0.22,
          bz + Math.sin(time * 0.22 + i * 0.5) * 0.14
        );
      }
      ambPos.needsUpdate = true;
    }

    // Hormone-inspired particles swirling around the ovaries
    hormoneMat.opacity = THREE.MathUtils.damp(
      hormoneMat.opacity,
      0.14 + hormoneIntensity * 0.68,
      4.5,
      safeDt
    );
    hormoneMat.size = THREE.MathUtils.damp(
      hormoneMat.size,
      0.08 + hormoneIntensity * 0.06,
      4.5,
      safeDt
    );

    if (animateMotion) {
      const hPos = hormoneGeo.attributes.position as THREE.BufferAttribute;
      const speed = 0.42 + hormoneIntensity * 0.55;
      for (let i = 0; i < hormoneCount; i++) {
        const baseAngle = hormoneSeeds[i * 4];
        const radius = hormoneSeeds[i * 4 + 1] * (0.85 + hormoneIntensity * 0.32);
        const yOff = hormoneSeeds[i * 4 + 2];
        const side = hormoneSeeds[i * 4 + 3];

        const a = baseAngle + time * speed * (side > 0 ? 1 : -1);
        hPos.setXYZ(
          i,
          side * 1.72 + Math.cos(a) * radius,
          -0.04 + yOff + Math.sin(time * 0.8 + i) * 0.08,
          -0.18 + Math.sin(a) * radius * 0.72
        );
      }
      hPos.needsUpdate = true;
    }

    // Gentle volumetric ray shimmer
    rayMat.opacity = 0.24 + (animateMotion ? Math.sin(time * 0.6) * 0.04 : 0) + hormoneIntensity * 0.08;
  };

  const dispose = () => {
    for (const d of disposables) {
      d.dispose();
    }
  };

  return {
    root,
    organGroups,
    organMaterials,
    raycastTargets,
    ambientParticles,
    hormoneParticles,
    lightRaysGroup,
    update,
    dispose,
  };
}
