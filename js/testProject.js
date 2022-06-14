function init() {
    
    // listen to the resize events
    window.addEventListener('resize', onResize, false);

    var camera;
    var scene;
    var renderer;
    var trackballControls;
    var GLTFScene = undefined;

    // initialize stats
    var stats = initStats();


    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);



    // create a render and set the size
    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 60, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    // position the cube
    cube.position.x = -4;
    cube.position.y = 3;
    cube.position.z = 0;

    // add the cube to the scene
    scene.add(cube);

    var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // position the sphere
    sphere.position.x = 20;
    sphere.position.y = 0;
    sphere.position.z = 2;
    sphere.castShadow = true;

    // add the sphere to the scene
    scene.add(sphere);

    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    // add subtle ambient lighting
    var ambienLight = new THREE.AmbientLight(0x353535);
    scene.add(ambienLight);

    var spotLight = new THREE.PointLight(0xffffff, 2, 100);
    spotLight.position.set(50, 50, 50);
    spotLight.castShadow = true;
    //spotLight.shadow.mapSize.width = 1024;
    //spotLight.shadow.mapSize.height = 1024;
    //spotLight.shadow.camera.near = 500;
    //spotLight.shadow.camera.far = 4000;
    //spotLight.shadow.camera.fov = 30;

    //var spotLight = new THREE.DirectionalLight(0xffffff, 1);
    //spotLight.position.set(-10, 20, -5);
    //spotLight.castShadow = true;
    scene.add(spotLight);

    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);

    // call the render function
    var step = 0;

    var controls = new function () {
        this.rotationSpeed = 0.02;
        this.bouncingSpeed = 0.03;
        this.color = 0x7777ff;
        this.ligthX = -10.0;
        this.ligthY = 20.0;
        this.ligthZ = -5.0;
        this.GLTFScaleX = 1;
        this.GLTFScaleY = 1;
        this.GLTFScaleZ = 1;
    };

    const gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'bouncingSpeed', 0, 0.5);
    gui.add(controls, 'ligthX', -100, 100);
    gui.add(controls, 'ligthY', -100, 100);
    gui.add(controls, 'ligthZ', -100, 100);
    gui.add(controls, 'GLTFScaleX', 0, 10);
    gui.add(controls, 'GLTFScaleY', 0, 10);
    gui.add(controls, 'GLTFScaleZ', 0, 10);
    gui.addColor(controls, 'color');

    

    const gltfLoader = new THREE.GLTFLoader();
    
//  gltfLoader.load('models/helmet/helmet.gltf', (gltf) => {
//    const GLTFScene = gltf.scene;
//    scene.add(GLTFScene);
 // });
    
//      gltfLoader.load('models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
//    const GLTFScene = gltf.scene;
//    scene.add(GLTFScene);
//  });
  //  
    
  
    
  gltfLoader.load('models/parkBench/scene.gltf', (gltf) => {
    
	GLTFScene = gltf.scene;    
    scene.add(GLTFScene);
  });
 
    // initialize the trackball controls and the clock which is needed

    createControls(camera);

    var clock = new THREE.Clock();

    render();

    function render() {

        // update the stats and the controls
        trackballControls.update(clock.getDelta());
        stats.update();

        // rotate the cube around its axes
        cube.rotation.x += controls.rotationSpeed;
        cube.rotation.y += controls.rotationSpeed;
        cube.rotation.z += controls.rotationSpeed;


        // bounce the sphere up and down
        step += controls.bouncingSpeed;
        sphere.position.x = 20 + (10 * (Math.cos(step)));
        sphere.position.y = 2 + (10 * Math.abs(Math.sin(step)));
        sphere.material = new THREE.MeshLambertMaterial({ color: controls.color });

        spotLight.position.set(controls.ligthX, controls.ligthY, controls.ligthZ);
        
        if(GLTFScene != undefined) GLTFScene.scale.set(controls.GLTFScaleX, controls.GLTFScaleY, controls.GLTFScaleZ);

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function createControls(camera) {

        trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

        trackballControls.rotateSpeed = 1.0;
        trackballControls.zoomSpeed = 1.2;
        trackballControls.panSpeed = 0.8;

        trackballControls.keys = ['KeyA', 'KeyS', 'KeyD'];
    }
}