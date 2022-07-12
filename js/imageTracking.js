function init() {

    // listen to the resize events
    window.addEventListener('resize', onResize, false);
    window.addEventListener('devicemotion', devicemotion, 1000);
    window.addEventListener('arjs-nft-loaded', NFTLoaded);

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
    //var stats = initStats();


    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    // create a camera, which defines where we're looking at.
    camera = new THREE.Camera();
    scene.add(camera);


    // create a render and set the size
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        precision: 'mediump',
    });

    //renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    //renderer.setSize(1280, 960);
    //renderer.domElement.style.position = 'absolute'
    //renderer.domElement.style.top = '0px'
    //renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement);


    var arToolkitSource = new THREEx.ArToolkitSource({

        // type of source - ['webcam', 'image', 'video']
        sourceType: 'webcam',
        // url of the source - valid if sourceType = image|video
        //   sourceUrl: null,

        // resolution of at which we initialize the source image
        sourceWidth: 480,
        sourceHeight: 640,
        // resolution displayed for the source 
        //displayWidth: 1280,
        //displayHeight: 960
    });

    function onResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);

        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    }

    arToolkitSource.init(function () {

        setTimeout(function () {

            onResize()

        }, 1000);
    });



    //arToolkitContext = new THREEx.ArToolkitContext({

    //  cameraParametersUrl: 'source/camera_para.dat',
    // //detectionMode: 'color_and_matrix'
    detectionMode: 'mono'
    // });

    var arToolkitContext = new THREEx.ArToolkitContext({
        detectionMode: 'mono',
        canvasWidth: 480,
        canvasHeight: 640,
    }, {
        sourceWidth: 480,
        sourceHeight: 640,
    })

    arToolkitContext.init(function () {

        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // init controls for camera
    var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {

        type: 'nft',
        descriptorsUrl: 'source/nft/test3',
        changeMatrixMode: 'cameraTransformMatrix'
    })

    scene.visible = false

    //var clock = new THREE.Clock();
    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);

    let geometry1 = new THREE.BoxGeometry(1, 1, 1);
    let material1 = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    mesh1 = new THREE.Mesh(geometry1, material1);
    //mesh1.position.y = 0.5;

    markerRoot1.add(mesh1);

    render();

    function render() {

        // update the stats and the controls
        //trackballControls.update(clock.getDelta());
        //stats.update();


        mesh1.rotation.x += 0.1;
        mesh1.rotation.y += 0.1;
        mesh1.rotation.z += 0.1;

        //if (isObjectLoaded == true) GLTFScene.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ);
        //if (isObjectLoaded == true) GLTFScene.position.set(controls.posX, controls.posY, controls.posZ);

        requestAnimationFrame(render);

        //if (!arToolkitSource.ready) {
        //  return;
        //}

        //arToolkitContext.update(arToolkitSource.domElement);
        scene.visible = camera.visible;
        if (arToolkitSource.ready !== false)
            arToolkitContext.update(arToolkitSource.domElement);

        renderer.render(scene, camera);
    }

    // function onResize() {
    //   camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();
    //     renderer.setSize(window.innerWidth, window.innerHeight);
    //}

    function devicemotion(event) {

        //controls.accX = event.acceleration.x;
        //gui.updateDisplay();
    }

    function NFTLoaded(event) {

        var e = event;

    }

    function createControls(camera) {

        trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

        trackballControls.rotateSpeed = 1.0;
        trackballControls.zoomSpeed = 1.2;
        trackballControls.panSpeed = 0.8;

        trackballControls.keys = ['KeyA', 'KeyS', 'KeyD'];
    }

    //const scope = this;

    function onMouseDown(event) {

        mousePointer.set(((event.pageX / window.innerWidth) * 2 - 1), (- (event.pageY / window.innerHeight) * 2 + 1));
        raycasterManager.setFromCamera(mousePointer, camera);
        var intersects = raycasterManager.intersectObjects(scene.children);
        controls.posX = intersects[0].point.x;
        controls.posY = intersects[0].point.y;
        controls.posZ = intersects[0].point.z;
    }
}
