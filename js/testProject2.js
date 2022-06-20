function init() {

    // listen to the resize events
    window.addEventListener('resize', onResize, false);
    window.addEventListener('click', onMouseDown, false);
    window.addEventListener('devicemotion', devicemotion, 1000);


    //const _changeEvent = { type: 'change' };
    //const _startEvent = { type: 'start' };
    //const _endEvent = { type: 'end' };


    var camera = undefined;
    var scene = undefined;
    var renderer = undefined;
    var trackballControls = undefined;
    var GLTFScene = undefined;
    var mousePointer = new THREE.Vector2();
    var raycasterManager = new THREE.Raycaster();
    var isObjectLoaded = false;
    var accelerometerData;

    // initialize stats
    var stats = initStats();


    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.Camera();

    scene.add(camera);


    // create a render and set the size
    renderer = new THREE.WebGLRenderer({

        antialias: true,
        alpha: true
    });

    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    var arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam
        sourceType: 'webcam',

        // // to read from an image
        // sourceType : 'image',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

        // to read from a video
        // sourceType : 'video',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
    });

    arToolkitSource.init(function () {

        setTimeout(function () {

            arToolkitSource.onResizeElement();
            arToolkitSource.copyElementSizeTo(renderer.domElement);

        }, 2000);
    });

    arToolkitContext = new THREEx.ArToolkitContext({

        cameraParametersUrl: 'source/camera_para.dat',
        detectionMode: 'color_and_matrix',
    });

    arToolkitContext.init(function () {

        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    camera({

        type: 'pattern',
        patternUrl: 'source/pattern-testMarker',
        changeMatrixMode: 'cameraTransformMatrix'

    });

    arMarkerControls = THREEx.ArMarkerControls(arToolkitContext, camera);

    scene.visible = false;

    var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshNormalMaterial({

        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cube.position.y = cubeGeometry.parametra.height / 2;

    scene.add(cube);

    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);

    var controls = new function () {
        this.rotationSpeed = 0.02;
        this.bouncingSpeed = 0.03;
        this.color = 0x7777ff;
        this.ligthX = -10.0;
        this.ligthY = 20.0;
        this.ligthZ = -5.0;
        this.scaleX = 5;
        this.scaleY = 5;
        this.scaleZ = 5;
        this.posX = 0;
        this.posY = 0;
        this.posZ = 0;
        this.accX = 0;
    };

    const gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'bouncingSpeed', 0, 0.5);
    gui.add(controls, 'ligthX', -100, 100);
    gui.add(controls, 'ligthY', -100, 100);
    gui.add(controls, 'ligthZ', -100, 100);
    gui.add(controls, 'scaleX', 0, 20);
    gui.add(controls, 'scaleY', 0, 20);
    gui.add(controls, 'scaleZ', 0, 20);
    gui.add(controls, 'posX', -100, 100);
    gui.add(controls, 'posY', -100, 100);
    gui.add(controls, 'posZ', -100, 100);
    gui.add(controls, 'accX');
    gui.addColor(controls, 'color');

    //const gltfLoader = new THREE.GLTFLoader();
    //const loaderManagere = new THREE.LoadingManager();

    //gltfLoader.load('models/parkBench/scene.gltf', (gltf) => {

    //    GLTFScene = gltf.scene;
    //   scene.add(GLTFScene);
    //   isObjectLoaded = true;
    // });

    // initialize the trackball controls and the clock which is needed

    createControls(camera);

    //var clock = new THREE.Clock();

    render();

    function render() {

        // update the stats and the controls
        trackballControls.update(clock.getDelta());
        stats.update();

        //if (isObjectLoaded == true) GLTFScene.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ);
        //if (isObjectLoaded == true) GLTFScene.position.set(controls.posX, controls.posY, controls.posZ);

        requestAnimationFrame(render);
        arToolkitContext.update(arToolkitSource.domElement);
        scene.visible = camera.visible;

        renderer.render(scene, camera);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function devicemotion(event) {

        controls.accX = event.acceleration.x;
        gui.updateDisplay();
    }

    function createControls(camera) {

        trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

        trackballControls.rotateSpeed = 1.0;
        trackballControls.zoomSpeed = 1.2;
        trackballControls.panSpeed = 0.8;

        trackballControls.keys = ['KeyA', 'KeyS', 'KeyD'];
    }

    const scope = this;

    function onMouseDown(event) {

        mousePointer.set(((event.pageX / window.innerWidth) * 2 - 1), (- (event.pageY / window.innerHeight) * 2 + 1));
        raycasterManager.setFromCamera(mousePointer, camera);
        var intersects = raycasterManager.intersectObjects(scene.children);
        controls.posX = intersects[0].point.x;
        controls.posY = intersects[0].point.y;
        controls.posZ = intersects[0].point.z;
    }
}
