// ============================================
// CLOUD3D.JS - Modul untuk mengelola objek 3D awan
// ============================================

import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// ===== VARIABEL GLOBAL MODULE =====
let scene, camera, renderer, controls;
let currentCloudGroup = null;
let currentRotationAngle = 0;
let rotationAnimation = null;
let currentYPosition = 1;
let yAnimation = null;

// ===== KONFIGURASI AWAN =====
export const cloudConfigs = {
    cumulus: { color: 0xffffff, scale: 0.7, yOffset: 1 },
    cirrocumulus: { color: 0xe0f0ff, scale: 0.7, yOffset: 1 },
    altocumulus: { color: 0xd0e0f0, scale: 0.7, yOffset: 1 },
    altostratus: { color: 0xa0b0c0, scale: 0.7, yOffset: 1 },
    cirrus: { color: 0xf0f8ff, scale: 0.7, yOffset: 1 },
    cirrostratus: { color: 0xe8f0fe, scale: 0.7, yOffset: 1 },
    cumulonimbus: { color: 0x4a5a6a, scale: 0.7, yOffset: 1 },
    nimbostratus: { color: 0x3a4a5a, scale: 0.7, yOffset: 1 },
    stratocumulus: { color: 0x8a9aad, scale: 0.7, yOffset: 1 },
    stratus: { color: 0x9aabbc, scale: 0.7, yOffset: 1 }
};

// ===== FUNGSI MEMBUAT AWAN 3D REALISTIK =====
export function createRealisticCloud(type, baseColor) {
    const group = new THREE.Group();

    const mainMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.45,
        metalness: 0.02,
        emissive: 0x221133,
        emissiveIntensity: 0.08
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: Math.min(baseColor + 0x111111, 0xffffff),
        roughness: 0.35,
        metalness: 0.01,
        emissive: 0x331144,
        emissiveIntensity: 0.05
    });

    const shadowMaterial = new THREE.MeshStandardMaterial({
        color: Math.max(baseColor - 0x222222, 0x666666),
        roughness: 0.55,
        metalness: 0.01
    });

    // ==================== AWAN CUMULUS ====================
    if (type === 'cumulus') {
        const positions = [
            { x: -1.2, y: 0.1, z: -0.8, r: 0.85, m: shadowMaterial },
            { x: -0.5, y: 0, z: -1.0, r: 0.9, m: shadowMaterial },
            { x: 0.3, y: 0.05, z: -0.9, r: 0.88, m: mainMaterial },
            { x: 1.0, y: 0.1, z: -0.7, r: 0.82, m: mainMaterial },
            { x: 1.5, y: 0.2, z: -0.3, r: 0.78, m: shadowMaterial },
            { x: -1.5, y: 0.15, z: -0.2, r: 0.8, m: mainMaterial },
            { x: -1.0, y: 0.2, z: 0.3, r: 0.84, m: mainMaterial },
            { x: -0.3, y: 0.1, z: 0.5, r: 0.86, m: mainMaterial },
            { x: 0.5, y: 0.15, z: 0.4, r: 0.85, m: highlightMaterial },
            { x: 1.2, y: 0.2, z: 0.2, r: 0.8, m: mainMaterial },
            { x: -1.1, y: 0.7, z: -0.6, r: 0.9, m: mainMaterial },
            { x: -0.4, y: 0.85, z: -0.7, r: 0.95, m: highlightMaterial },
            { x: 0.4, y: 0.8, z: -0.5, r: 0.92, m: mainMaterial },
            { x: 1.1, y: 0.7, z: -0.4, r: 0.85, m: mainMaterial },
            { x: -0.8, y: 0.75, z: 0.1, r: 0.88, m: mainMaterial },
            { x: 0.0, y: 0.9, z: 0.0, r: 0.93, m: highlightMaterial },
            { x: 0.8, y: 0.75, z: -0.1, r: 0.87, m: mainMaterial },
            { x: -0.7, y: 1.4, z: -0.4, r: 0.82, m: highlightMaterial },
            { x: 0.0, y: 1.55, z: -0.3, r: 0.85, m: highlightMaterial },
            { x: 0.7, y: 1.45, z: -0.2, r: 0.8, m: highlightMaterial },
            { x: -0.3, y: 1.3, z: 0.1, r: 0.78, m: mainMaterial },
            { x: 0.4, y: 1.35, z: 0.0, r: 0.79, m: mainMaterial },
            { x: -0.2, y: 2.0, z: -0.2, r: 0.7, m: highlightMaterial },
            { x: 0.3, y: 1.9, z: -0.1, r: 0.68, m: highlightMaterial }
        ];

        positions.forEach(p => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 32), p.m);
            sphere.position.set(p.x, p.y, p.z);
            sphere.castShadow = true;
            group.add(sphere);
        });
    }

    // ==================== AWAN STRATUS ====================
    else if (type === 'stratus') {
        for (let layer = 0; layer < 3; layer++) {
            const yOffset = layer * 0.45;
            const material = layer === 1 ? highlightMaterial : (layer === 0 ? shadowMaterial : mainMaterial);

            for (let i = 0; i < 12; i++) {
                const x = -2.2 + (i * 0.42);
                const z = (Math.sin(i * 0.8) * 0.6) + (layer === 1 ? 0.2 : 0);
                const radius = 0.45 + (layer === 1 ? 0.1 : 0) + (Math.sin(i) * 0.05);

                const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 28), material);
                sphere.position.set(x, yOffset + 0.2, z);
                sphere.castShadow = true;
                group.add(sphere);
            }
        }

        for (let i = 0; i < 6; i++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.4 + Math.random() * 0.15, 24, 24),
                mainMaterial
            );
            sphere.position.set(-1.5 + Math.random() * 3, 0.4 + Math.random() * 0.5, -0.8 + Math.random() * 1.6);
            group.add(sphere);
        }
    }

    // ==================== AWAN CIRRUS ====================
    else if (type === 'cirrus') {
        const cirrusMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8f0ff,
            roughness: 0.25,
            metalness: 0.0,
            emissive: 0x88aacc,
            emissiveIntensity: 0.12,
            transparent: true,
            opacity: 0.75
        });

        const cirrusMaterialTipis = new THREE.MeshStandardMaterial({
            color: 0xf0f4ff,
            roughness: 0.20,
            metalness: 0.0,
            emissive: 0xaaccff,
            emissiveIntensity: 0.10,
            transparent: true,
            opacity: 0.65
        });

        for (let x = -2.2; x <= 2.2; x += 0.18) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.09 + Math.random() * 0.07, 12, 12), cirrusMaterial);
            sphere.position.set(x, 1.25 + Math.sin(x * 0.8) * 0.08, -0.2 + Math.cos(x * 0.6) * 0.12);
            group.add(sphere);
        }

        for (let x = -2.0; x <= 2.0; x += 0.20) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.07 + Math.random() * 0.06, 12, 12), cirrusMaterialTipis);
            sphere.position.set(x, 1.52 + Math.cos(x * 0.9) * 0.06, 0.1 + Math.sin(x * 0.7) * 0.10);
            group.add(sphere);
        }

        for (let x = -2.1; x <= 2.1; x += 0.22) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 12, 12), cirrusMaterial);
            sphere.position.set(x, 0.95 + Math.sin(x * 0.7) * 0.10, -0.55 + Math.cos(x * 0.5) * 0.15);
            group.add(sphere);
        }

        for (let i = 0; i < 120; i++) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.08, 10, 10), cirrusMaterialTipis);
            sphere.position.set(-2.4 + Math.random() * 4.8, 0.85 + Math.random() * 1.1, -0.8 + Math.random() * 1.4);
            group.add(sphere);
        }

        for (let i = 0; i < 25; i++) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.10, 14, 14), cirrusMaterial);
            sphere.position.set(-1.8 + Math.random() * 3.6, 1.05 + Math.random() * 0.7, -0.5 + Math.random() * 1.0);
            group.add(sphere);
        }
    }

    // ==================== AWAN CIRROCUMULUS ====================
    else if (type === 'cirrocumulus') {
        const cirrocumulusMaterial = new THREE.MeshStandardMaterial({
            color: 0xeef4ff,
            roughness: 0.22,
            metalness: 0.0,
            emissive: 0xaaccff,
            emissiveIntensity: 0.08,
            transparent: true,
            opacity: 0.82
        });

        const cirrocumulusMaterialGelap = new THREE.MeshStandardMaterial({
            color: 0xdde4f0,
            roughness: 0.28,
            metalness: 0.0,
            emissive: 0x88aacc,
            emissiveIntensity: 0.06,
            transparent: true,
            opacity: 0.78
        });

        for (let x = -2.0; x <= 2.0; x += 0.45) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.08, 20, 20), cirrocumulusMaterial);
            sphere.position.set(x, 1.05 + Math.sin(x * 1.5) * 0.08, -0.45);
            group.add(sphere);
        }

        for (let x = -1.8; x <= 1.8; x += 0.48) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.20 + Math.random() * 0.07, 20, 20), cirrocumulusMaterialGelap);
            sphere.position.set(x, 1.12 + Math.cos(x * 1.8) * 0.06, -0.18);
            group.add(sphere);
        }

        for (let x = -1.9; x <= 1.9; x += 0.47) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.21 + Math.random() * 0.07, 20, 20), cirrocumulusMaterial);
            sphere.position.set(x, 1.08 + Math.sin(x * 1.6) * 0.07, 0.1);
            group.add(sphere);
        }

        for (let x = -2.1; x <= 2.1; x += 0.50) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.19 + Math.random() * 0.06, 20, 20), cirrocumulusMaterialGelap);
            sphere.position.set(x, 1.15 + Math.cos(x * 1.7) * 0.05, 0.38);
            group.add(sphere);
        }

        for (let i = 0; i < 45; i++) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.16 + Math.random() * 0.09, 18, 18), cirrocumulusMaterial);
            sphere.position.set(-2.3 + Math.random() * 4.6, 0.98 + Math.random() * 0.28, -0.65 + Math.random() * 1.3);
            group.add(sphere);
        }
    }

    // ==================== AWAN CIRROSTRATUS ====================
    else if (type === 'cirrostratus') {
        const cirrostratusMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f6ff,
            roughness: 0.18,
            metalness: 0.0,
            emissive: 0xbbddff,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.68
        });

        const cirrostratusMaterialTipis = new THREE.MeshStandardMaterial({
            color: 0xf5faff,
            roughness: 0.15,
            metalness: 0.0,
            emissive: 0xcceeFF,
            emissiveIntensity: 0.12,
            transparent: true,
            opacity: 0.60
        });

        for (let x = -2.5; x <= 2.5; x += 0.35) {
            for (let z = -1.0; z <= 1.0; z += 0.45) {
                const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.08, 16, 16), cirrostratusMaterialTipis);
                sphere.position.set(x, 0.85 + Math.cos(x * 1.2 + z) * 0.05, z);
                group.add(sphere);
            }
        }

        for (let x = -2.3; x <= 2.3; x += 0.38) {
            for (let z = -0.9; z <= 0.9; z += 0.48) {
                const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.17 + Math.random() * 0.07, 16, 16), cirrostratusMaterial);
                sphere.position.set(x, 1.05 + Math.sin(x * 1.0 + z * 0.8) * 0.04, z);
                group.add(sphere);
            }
        }

        for (let x = -2.4; x <= 2.4; x += 0.36) {
            for (let z = -0.8; z <= 0.8; z += 0.50) {
                const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.16 + Math.random() * 0.08, 16, 16), cirrostratusMaterialTipis);
                sphere.position.set(x, 1.28 + Math.cos(x * 1.1 + z * 0.9) * 0.04, z);
                group.add(sphere);
            }
        }

        for (let i = 0; i < 200; i++) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 12, 12), cirrostratusMaterial);
            sphere.position.set(-3.0 + Math.random() * 6.0, 0.75 + Math.random() * 0.9, -1.2 + Math.random() * 2.4);
            group.add(sphere);
        }
    }

    // ==================== AWAN ALTOCUMULUS ====================
    else if (type === 'altocumulus') {
        const altocumulusPutih = new THREE.MeshStandardMaterial({
            color: 0xf0f4f8,
            roughness: 0.40,
            metalness: 0.0
        });

        const altocumulusAbu = new THREE.MeshStandardMaterial({
            color: 0xd0d8e0,
            roughness: 0.45,
            metalness: 0.0
        });

        const altocumulusGelap = new THREE.MeshStandardMaterial({
            color: 0xb0b8c0,
            roughness: 0.50,
            metalness: 0.0
        });

        for (let col = 0; col < 5; col++) {
            const x = -1.6 + (col * 0.8);
            const z = -0.9;
            const yVar = Math.sin(col * 0.8) * 0.15;
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.52, 28, 28), altocumulusGelap);
            sphere.position.set(x, 0.4 + yVar, z);
            group.add(sphere);
        }

        for (let col = 0; col < 5; col++) {
            const x = -1.4 + (col * 0.8);
            const z = -0.2;
            const yVar = Math.cos(col * 0.8) * 0.12;
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.54, 28, 28), altocumulusAbu);
            sphere.position.set(x, 0.65 + yVar, z);
            group.add(sphere);
        }

        for (let col = 0; col < 5; col++) {
            const x = -1.5 + (col * 0.8);
            const z = 0.5;
            const yVar = Math.sin(col * 0.9) * 0.10;
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.50, 28, 28), altocumulusPutih);
            sphere.position.set(x, 0.90 + yVar, z);
            group.add(sphere);
        }

        for (let col = 0; col < 4; col++) {
            const x = -1.2 + (col * 0.9);
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.44, 26, 26), altocumulusPutih);
            sphere.position.set(x, 1.20, -0.15);
            group.add(sphere);
        }

        for (let i = 0; i < 20; i++) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.32 + Math.random() * 0.15, 24, 24), altocumulusAbu);
            sphere.position.set(-1.8 + Math.random() * 3.6, 0.35 + Math.random() * 1.0, -1.0 + Math.random() * 1.8);
            group.add(sphere);
        }
    }

    // ==================== AWAN ALTOSTRATUS ====================
    else if (type === 'altostratus') {
        const altostratusGelap = new THREE.MeshStandardMaterial({
            color: 0x8a9aad,
            roughness: 0.5,
            metalness: 0.0
        });

        const altostratusTerang = new THREE.MeshStandardMaterial({
            color: 0xa0b0c0,
            roughness: 0.4,
            metalness: 0.0
        });

        for (let layer = 0; layer < 4; layer++) {
            const yOffset = layer * 0.35;
            const material = layer < 2 ? altostratusGelap : altostratusTerang;

            for (let x = -2.8; x <= 2.8; x += 0.5) {
                for (let z = -1.2; z <= 1.2; z += 0.6) {
                    const radius = 0.35 + Math.random() * 0.15;
                    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 24), material);
                    sphere.position.set(x, 0.3 + yOffset + Math.sin(x) * 0.05, z);
                    sphere.castShadow = true;
                    group.add(sphere);
                }
            }
        }
    }

    // ==================== AWAN NIMBOSTRATUS ====================
    else if (type === 'nimbostratus') {
        const nimbostratusGelap = new THREE.MeshStandardMaterial({
            color: 0x3a4a5a,
            roughness: 0.7,
            metalness: 0.02,
            emissive: 0x111133,
            emissiveIntensity: 0.05
        });

        const nimbostratusTerang = new THREE.MeshStandardMaterial({
            color: 0x5a6a7a,
            roughness: 0.6,
            metalness: 0.01
        });

        for (let layer = 0; layer < 5; layer++) {
            const yOffset = layer * 0.3;
            const material = layer < 2 ? nimbostratusGelap : nimbostratusTerang;

            for (let x = -3.0; x <= 3.0; x += 0.45) {
                for (let z = -1.5; z <= 1.5; z += 0.7) {
                    const radius = 0.4 + Math.random() * 0.2;
                    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 26, 26), material);
                    sphere.position.set(x, 0.2 + yOffset + Math.sin(x * 0.8) * 0.08, z + Math.cos(z * 0.5) * 0.1);
                    sphere.castShadow = true;
                    group.add(sphere);
                }
            }
        }
    }

    // ==================== AWAN STRATOCUMULUS ====================
    else if (type === 'stratocumulus') {
        const stratocumulusMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a9aad,
            roughness: 0.5,
            metalness: 0.0
        });

        const stratocumulusHighlight = new THREE.MeshStandardMaterial({
            color: 0xaabccc,
            roughness: 0.4,
            metalness: 0.0
        });

        for (let row = 0; row < 3; row++) {
            const yOffset = row * 0.5;

            for (let i = 0; i < 8; i++) {
                const x = -2.2 + (i * 0.6);
                const z = (row === 1 ? 0 : -0.5 + (row * 0.5));
                const radius = 0.55 + (row === 1 ? 0.1 : 0);

                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(radius, 28, 28),
                    row === 1 ? stratocumulusHighlight : stratocumulusMaterial
                );
                sphere.position.set(x, 0.3 + yOffset, z);
                sphere.castShadow = true;
                group.add(sphere);
            }
        }

        for (let i = 0; i < 15; i++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 24, 24),
                stratocumulusMaterial
            );
            sphere.position.set(-2.0 + Math.random() * 4, 0.2 + Math.random() * 1.2, -1.0 + Math.random() * 2);
            group.add(sphere);
        }
    }

    // ==================== AWAN CUMULONIMBUS ====================
    else if (type === 'cumulonimbus') {
        for (let x = -1.8; x <= 1.8; x += 0.45) {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.65 + Math.random() * 0.2, 28, 28), shadowMaterial);
            sphere.position.set(x, 0.1, Math.sin(x) * 0.5);
            group.add(sphere);
        }

        const badan = [
            { x: -1.4, y: 0.55, z: -0.6, r: 0.88, m: mainMaterial },
            { x: -0.7, y: 0.62, z: -0.7, r: 0.92, m: shadowMaterial },
            { x: 0.0, y: 0.65, z: -0.65, r: 0.95, m: mainMaterial },
            { x: 0.7, y: 0.60, z: -0.55, r: 0.91, m: mainMaterial },
            { x: 1.4, y: 0.52, z: -0.4, r: 0.86, m: mainMaterial },
            { x: -1.2, y: 0.58, z: 0.1, r: 0.85, m: mainMaterial },
            { x: -0.5, y: 0.65, z: 0.0, r: 0.90, m: highlightMaterial },
            { x: 0.5, y: 0.63, z: -0.1, r: 0.89, m: mainMaterial },
            { x: 1.2, y: 0.55, z: 0.05, r: 0.84, m: mainMaterial },
            { x: -1.0, y: 0.60, z: 0.7, r: 0.83, m: mainMaterial },
            { x: -0.2, y: 0.68, z: 0.6, r: 0.88, m: mainMaterial },
            { x: 0.6, y: 0.65, z: 0.5, r: 0.86, m: highlightMaterial },
            { x: 1.3, y: 0.58, z: 0.4, r: 0.82, m: mainMaterial }
        ];

        badan.forEach(b => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(b.r, 32, 32), b.m);
            sphere.position.set(b.x, b.y, b.z);
            group.add(sphere);
        });

        const tengah = [
            { x: -1.1, y: 1.15, z: -0.5, r: 0.85, m: mainMaterial },
            { x: -0.4, y: 1.25, z: -0.55, r: 0.90, m: highlightMaterial },
            { x: 0.4, y: 1.22, z: -0.45, r: 0.89, m: mainMaterial },
            { x: 1.1, y: 1.12, z: -0.3, r: 0.84, m: mainMaterial },
            { x: -0.8, y: 1.20, z: 0.15, r: 0.86, m: mainMaterial },
            { x: 0.0, y: 1.28, z: 0.05, r: 0.91, m: highlightMaterial },
            { x: 0.8, y: 1.18, z: -0.05, r: 0.85, m: mainMaterial }
        ];

        tengah.forEach(t => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(t.r, 32, 32), t.m);
            sphere.position.set(t.x, t.y, t.z);
            group.add(sphere);
        });

        const atas = [
            { x: -0.8, y: 1.75, z: -0.4, r: 0.78, m: highlightMaterial },
            { x: -0.2, y: 1.85, z: -0.45, r: 0.82, m: highlightMaterial },
            { x: 0.5, y: 1.80, z: -0.35, r: 0.80, m: highlightMaterial },
            { x: -0.5, y: 1.80, z: 0.1, r: 0.79, m: mainMaterial },
            { x: 0.2, y: 1.88, z: 0.0, r: 0.83, m: highlightMaterial },
            { x: 0.9, y: 1.78, z: -0.1, r: 0.77, m: mainMaterial }
        ];

        atas.forEach(a => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(a.r, 30, 30), a.m);
            sphere.position.set(a.x, a.y, a.z);
            group.add(sphere);
        });

        const puncak = [
            { x: -0.3, y: 2.35, z: -0.3, r: 0.68, m: highlightMaterial },
            { x: 0.3, y: 2.40, z: -0.25, r: 0.70, m: highlightMaterial },
            { x: 0.0, y: 2.10, z: 0.05, r: 0.65, m: mainMaterial }
        ];

        puncak.forEach(p => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(p.r, 30, 30), p.m);
            sphere.position.set(p.x, p.y, p.z);
            group.add(sphere);
        });

        for (let i = 0; i < 35; i++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.45 + Math.random() * 0.35, 26, 26),
                Math.random() > 0.6 ? highlightMaterial : mainMaterial
            );
            sphere.position.set(-1.5 + Math.random() * 3.0, 0.3 + Math.random() * 2.3, -1.2 + Math.random() * 2.0);
            group.add(sphere);
        }
    }

    // ==================== DEFAULT (untuk berjaga-jaga) ====================
    else {
        const positions = [
            { x: -1.0, y: 0, z: -0.5, r: 0.8 }, { x: -0.3, y: -0.1, z: -0.6, r: 0.85 },
            { x: 0.4, y: 0, z: -0.5, r: 0.82 }, { x: 1.0, y: 0.05, z: -0.3, r: 0.78 },
            { x: -0.8, y: 0.6, z: -0.3, r: 0.85 }, { x: -0.2, y: 0.75, z: -0.4, r: 0.9 },
            { x: 0.5, y: 0.7, z: -0.3, r: 0.88 }, { x: 0, y: 1.3, z: -0.2, r: 0.8 }
        ];

        positions.forEach(p => {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(p.r, 32, 32), mainMaterial);
            sphere.position.set(p.x, p.y, p.z);
            group.add(sphere);
        });
    }

    group.userData = { type: type };
    return group;
}

// ===== SETUP SCENE THREE.JS =====
export function setupThreeScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container dengan ID '${containerId}' tidak ditemukan`);
        return null;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0F1F);
    scene.fog = new THREE.FogExp2(0x0A0F1F, 0.008);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(5, 3, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(5, 10, 7);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(0x4466cc, 0.5);
    fillLight.position.set(-3, 2, 4);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0xffaa66, 0.4);
    backLight.position.set(0, 2, -5);
    scene.add(backLight);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(20, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2a40, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(25, 20, 0x2b7fc3, 0x1a3a5a);
    gridHelper.position.y = -1.1;
    scene.add(gridHelper);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1000;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
        starsPositions[i] = (Math.random() - 0.5) * 200;
        starsPositions[i + 1] = (Math.random() - 0.5) * 100;
        starsPositions[i + 2] = (Math.random() - 0.5) * 100 - 50;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    return { scene, camera, renderer, controls };
}

// ===== FUNGSI ROTASI 90 DERAJAT =====
export function rotateCloud90Degrees(direction) {
    if (rotationAnimation) cancelAnimationFrame(rotationAnimation);
    if (!currentCloudGroup) return;

    const targetAngle = currentRotationAngle + (direction === 'right' ? Math.PI / 2 : -Math.PI / 2);
    const startAngle = currentRotationAngle;
    const duration = 500;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentRotationAngle = startAngle + (targetAngle - startAngle) * ease;
        currentCloudGroup.rotation.y = currentRotationAngle;
        if (progress < 1) rotationAnimation = requestAnimationFrame(animate);
        else rotationAnimation = null;
    }
    rotationAnimation = requestAnimationFrame(animate);
}

// ===== FUNGSI GERAK VERTIKAL =====
export function moveCloudVertical(direction) {
    if (yAnimation) cancelAnimationFrame(yAnimation);
    if (!currentCloudGroup) return;

    const targetY = currentYPosition + (direction === 'up' ? 0.3 : -0.3);
    const targetYClamped = Math.max(-0.5, Math.min(2.5, targetY));
    const startY = currentYPosition;
    const duration = 400;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentYPosition = startY + (targetYClamped - startY) * ease;
        currentCloudGroup.position.y = currentYPosition;
        if (progress < 1) yAnimation = requestAnimationFrame(animate);
        else yAnimation = null;
    }
    yAnimation = requestAnimationFrame(animate);
}

// ===== FUNGSI RESET ROTASI DAN POSISI =====
export function resetCloudTransform() {
    if (rotationAnimation) cancelAnimationFrame(rotationAnimation);
    if (yAnimation) cancelAnimationFrame(yAnimation);
    currentRotationAngle = 0;
    currentYPosition = 1;
    if (currentCloudGroup) {
        currentCloudGroup.rotation.y = 0;
        currentCloudGroup.position.y = 1;
    }
}

// ===== FUNGSI GANTI AWAN =====
export function changeCloud(type, color, name, code, desc) {
    if (currentCloudGroup && scene) scene.remove(currentCloudGroup);

    currentCloudGroup = createRealisticCloud(type, color);
    currentCloudGroup.position.set(0, 1, 0);
    currentCloudGroup.scale.set(0.7, 0.7, 0.7);
    currentCloudGroup.rotation.y = currentRotationAngle;
    currentCloudGroup.position.y = currentYPosition;
    if (scene) scene.add(currentCloudGroup);

    // Update UI elements
    const currentCloudName = document.getElementById('currentCloudName');
    const currentCloudCode = document.getElementById('currentCloudCode');
    const currentCloudDesc = document.getElementById('currentCloudDesc');

    if (currentCloudName) currentCloudName.textContent = name;
    if (currentCloudCode) currentCloudCode.textContent = code;
    if (currentCloudDesc) currentCloudDesc.textContent = desc;

    if (controls) controls.autoRotate = true;
}

// ===== LOAD DEFAULT CLOUD =====
export function loadDefaultCloud() {
    if (currentCloudGroup && scene) scene.remove(currentCloudGroup);
    currentCloudGroup = createRealisticCloud('cumulus', 0xffffff);
    currentCloudGroup.position.set(0, 1, 0);
    currentCloudGroup.scale.set(0.7, 0.7, 0.7);
    if (scene) scene.add(currentCloudGroup);
    return currentCloudGroup;
}

// ===== START ANIMASI LOOP =====
let animationId = null;
export function startAnimation() {
    if (animationId) cancelAnimationFrame(animationId);

    function animate() {
        animationId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
    }
    animate();
}

// ===== STOP ANIMASI LOOP =====
export function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ===== GETTER UNTUK AKSES GLOBAL =====
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getControls() { return controls; }
export function getCurrentCloudGroup() { return currentCloudGroup; }