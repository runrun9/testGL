(function(){
  var stats;
  var mesh, camera, scene, renderer;
  var helper;
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var clock = new THREE.Clock();
  var modelReady = false;
  var musicReady = false;
  var controls;
  var composer,glitchPass;
  var world;

  init();
  loop();

  function init() {
    world = document.getElementById('world');
      // シーンの作成
      scene = new THREE.Scene();

      // FPSの表示
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      stats.domElement.style.zIndex = 100;
      world.appendChild(stats.domElement);

      // 光の作成
      var ambient = new THREE.AmbientLight(0xeeeeee);
      scene.add(ambient);
      var light1 = new THREE.DirectionalLight(0x888888, 0.3);
      light1.position.set(-50, 15, 30);
      scene.add(light1);
      var light2 = new THREE.DirectionalLight(0x888888, 0.3);
      light2.position.set(50, 15, 30);
      scene.add(light2);

      // 画面表示の設定
      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(windowWidth, windowHeight);
      renderer.setClearColor(new THREE.Color( 0xffffff));
      world.appendChild(renderer.domElement);

      // カメラの作成
      camera = new THREE.PerspectiveCamera(50, windowWidth / windowHeight, 1, 1000);
      camera.position.set(0, 10, 35);
      scene.add(camera);
      console.log("カメラのポジ");
      console.log(camera.position);
      // VR表示へ変換
      effect = new THREE.StereoEffect(renderer);
      //pcの場合ドラッグ操作
      controls = new THREE.OrbitControls(camera, effect.domElement);
      // スマートフォンの場合はジャイロセンサーでの操作へ変更
      function setOrientationControls(e) {
        if (!e.alpha) {
          return;
        }

        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        //element.addEventListener("click", fullscreen, false);

        window.removeEventListener("deviceorientation", setOrientationControls, true);
      }
      window.addEventListener("deviceorientation", setOrientationControls, true);
      //controls.rotateUp(Math.PI / 4);
      controls.target.set(
        camera.position.x,
        camera.position.y,
        camera.position.z-0.15
      );
      controls.noZoom = true;
      controls.noPan = true;
      controls.update();

      // ステージの作成
      var sGeometry = new THREE.PlaneGeometry(300, 300);
      var stageTexture = THREE.ImageUtils.loadTexture('sirokuroA.jpg');
      stageTexture.wrapS = stageTexture.wrapT = THREE.RepeatWrapping;
      stageTexture.repeat.set(100, 100);
      var sMaterial = new THREE.MeshLambertMaterial({map:stageTexture, side: THREE.DoubleSlide});
      var stage = new THREE.Mesh(sGeometry, sMaterial);
      stage.position.set(0, -10, 0)
      stage.rotation.x = -90 * Math.PI / 180;
      scene.add(stage);

      // モデル読み込み(キツネ)
      // パーサーを作ります
      var parser = new vox.Parser();

      // *.voxファイルを読み込みます
      parser.parse("models/vox/chr_fox.vox").then(function(voxelData) { // ←ボクセルデータが取れます
        // // データ全体の大きさ
        // voxelData.size; // => { x: number, y: number, z: number }
        // // ボクセルの配列
        // voxelData.voxels; // => [Voxel, Voxel, Voxel, ...]
        // // ボクセル一個のデータ
        // voxelData.voxels[0]; // => { x: number, y: number, z: number, colorIndex: number }
        // // カラーパレット
        // voxelData.palette; // => [Color, Color, Color, ...]
        // voxelData.palette[0]; // => { r: number, g: number, b: number, a: number }

        // ビルダーを作ります。引数にボクセルデータをわたします
        var builder = new vox.MeshBuilder(voxelData);
        // THREE.Meshを作ります
        mesh = builder.createMesh();
        // THREE.Sceneに追加するなどして使ってください
        // mesh.material.specular="0xffff00";
        mesh.material.specular.r=0;
        mesh.material.specular.g=255;
        mesh.material.specular.b=255;
        mesh.material.shininess=1000;
        mesh.material.transparent=true;
        mesh.material.opacity=0.7;
        // console.log(mesh.material.ambient.toSource()+"です");
        scene.add(mesh);
        var edge = new THREE.EdgesHelper( mesh, "#000" );
        edge.material.linewidth = 2;
        scene.add(edge);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        console.log("キツネのポジ");
        console.log(mesh.position);
      });

      ////////////////////////////////////////
      // shadow
      light1.castShadow = true;
      light2.castShadow = true;
      stage.receiveShadow = true;
      renderer.shadowMapEnabled = true;

      ////////////////////////////////////////

      // リサイズ時
      window.addEventListener('resize', onWindowResize, false);
      onWindowResize();
  }

  function onWindowResize() {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      camera.aspect = windowWidth / windowHeight;
      camera.updateProjectionMatrix();
      effect.setSize(windowWidth, windowHeight);
  }

  function loop() {
    requestAnimationFrame(loop);
    render();
  }

  function render() {
      // renderer.clear();
      effect.render(scene, camera);
      stats.update();
      controls.update();

      mesh.rotation.y += 0.01;
      // mesh.scale.x += 0.0005;
      // mesh.scale.y += 0.0005;
      // mesh.scale.z += 0.0005;
  }
})();
