/* ============================================================
   GLOBE.JS — Globo Terrestre Interativo com Three.js
   Usado exclusivamente no Slide 15 (Encerramento)
   ============================================================ */

(function () {
  'use strict';

  /* ── Aguarda o Three.js carregar ─────────────────────────── */
  function waitForThree(cb, attempts) {
    attempts = attempts || 0;
    if (typeof THREE !== 'undefined') {
      cb();
    } else if (attempts < 30) {
      setTimeout(function () { waitForThree(cb, attempts + 1); }, 200);
    }
  }

  /* ── Inicializa o globo ───────────────────────────────────── */
  function initGlobe() {
    var canvas = document.getElementById('earth-canvas');
    var slide  = document.getElementById('slide-15');
    if (!canvas || !slide) return;

    /* Dimensões */
    var W = slide.clientWidth  || window.innerWidth;
    var H = slide.clientHeight || window.innerHeight;

    /* ── Renderer ─────────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    /* ── Cena e Câmera ────────────────────────────────────── */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500);
    camera.position.z = 2.6;

    /* ── Estrelas de fundo ────────────────────────────────── */
    var starPositions = new Float32Array(6000);
    for (var i = 0; i < 6000; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    /* ── Carregador de texturas ───────────────────────────── */
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    /* Texturas públicas e confiáveis */
    var BASE = 'https://unpkg.com/three-globe/example/img/';

    /* ── Terra ────────────────────────────────────────────── */
    var earthGeo = new THREE.SphereGeometry(1, 72, 72);
    var earthMat = new THREE.MeshPhongMaterial({
      map:        loader.load(BASE + 'earth-day.jpg'),
      bumpMap:    loader.load(BASE + 'earth-topology.png'),
      bumpScale:  0.045,
      specularMap: loader.load(BASE + 'earth-water.png'),
      specular:   new THREE.Color(0x1a3a5c),
      shininess:  20,
    });
    var earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    /* ── Nuvens ───────────────────────────────────────────── */
    var cloudGeo = new THREE.SphereGeometry(1.012, 72, 72);
    var cloudMat = new THREE.MeshPhongMaterial({
      map:        loader.load(BASE + 'earth-clouds.png'),
      transparent: true,
      opacity:    0.65,
      depthWrite: false,
    });
    var clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    /* ── Atmosfera (glow azul) ────────────────────────────── */
    var glowGeo = new THREE.SphereGeometry(1.16, 72, 72);
    var glowMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main(){',
        '  vNormal = normalize(normalMatrix * normal);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main(){',
        '  float intensity = pow(0.72 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.5);',
        '  gl_FragColor = vec4(0.12, 0.48, 1.0, 1.0) * intensity;',
        '}'
      ].join('\n'),
      blending:    THREE.AdditiveBlending,
      side:        THREE.BackSide,
      transparent: true,
    });
    var atmosphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(atmosphere);

    /* ── Iluminação ───────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x223344, 0.5));
    var sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    /* ── Interação (mouse + touch) ───────────────────────── */
    var isDragging  = false;
    var prevMouse   = { x: 0, y: 0 };
    var velX = 0, velY = 0.0015;

    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      prevMouse  = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', function () { isDragging = false; });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - prevMouse.x;
      var dy = e.clientY - prevMouse.y;
      velY = dx * 0.005;
      velX = dy * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    /* Touch */
    var prevTouch = null;
    canvas.addEventListener('touchstart', function (e) {
      prevTouch = e.touches[0];
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
      if (!prevTouch) return;
      velY = (e.touches[0].clientX - prevTouch.clientX) * 0.005;
      velX = (e.touches[0].clientY - prevTouch.clientY) * 0.005;
      prevTouch = e.touches[0];
    }, { passive: true });
    canvas.addEventListener('touchend', function () { prevTouch = null; }, { passive: true });

    /* ── Loop de animação ─────────────────────────────────── */
    function animate() {
      requestAnimationFrame(animate);

      /* Inércia suave */
      velY = isDragging ? velY : THREE.MathUtils.lerp(velY, 0.0015, 0.03);
      velX = isDragging ? velX : THREE.MathUtils.lerp(velX, 0,      0.03);

      earth.rotation.y      += velY;
      earth.rotation.x      += velX;
      clouds.rotation.y     = earth.rotation.y + 0.0008;
      clouds.rotation.x     = earth.rotation.x;
      atmosphere.rotation.y = earth.rotation.y;

      renderer.render(scene, camera);
    }
    animate();

    /* ── Responsivo ───────────────────────────────────────── */
    window.addEventListener('resize', function () {
      var w = slide.clientWidth;
      var h = slide.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  /* ── Dispara quando a DOM estiver pronta ─────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForThree(initGlobe); });
  } else {
    waitForThree(initGlobe);
  }

})();
