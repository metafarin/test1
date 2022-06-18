function init() {

    // listen to the resize events
    window.addEventListener('resize', onResize, false);
    window.addEventListener('click', onMouseDown, false);
    window.addEventListener('devicemotion', devicemotion, false);


    const _changeEvent = { type: 'change' };
    const _startEvent = { type: 'start' };
    const _endEvent = { type: 'end' };


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

    plane.name = "plane";

    // add the plane to the scene
    scene.add(plane);

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.name = "cube";

    // position the cube
    //cube.position.x = 0;
    //cube.position.y = 0;
    //cube.position.z = 0;

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

    sphere.name = "sphere";
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

    //First create and append a webgl renderer, then :
    //const ls = new LoadScreen(renderer).onComplete(init).start(ASSETS);

    //function init() {
        //Init scene, then :
       // ls.remove(animate);
   // }



    const gltfLoader = new THREE.GLTFLoader();
    const loaderManagere = new THREE.LoadingManager();

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
        isObjectLoaded = true;
    });

    // initialize the trackball controls and the clock which is needed

    createControls(camera);

    var clock = new THREE.Clock();

    //activate();

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
        //cube.position.set(controls.posX, controls.posY, controls.posZ);

        if (isObjectLoaded == true) GLTFScene.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ);
        if (isObjectLoaded == true) GLTFScene.position.set(controls.posX, controls.posY, controls.posZ);

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function devicemotion(event) {

        controls.accX = event.accelerometerData;


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
        //let my3dPosition = THREE.worldPointFromScreenPoint( viewportDown, mySceneCamera );

        //let rect = plane.geometry.boundingBox.max;
        //let rect = event.getBoundingClientRect()
        //controls.posX = event.clientX - rect.left; //x position within the element.
        //controls.posY = event.clientY - rect.top;  //y position within the element.

        // if (Math.abs(event.clientX - plane.geometry.parameters.height) > plane.geometry.parameters.height){

        //  controls.posX = plane.position.x;

        // } else {

        //    controls.posX = event.clientX;
        // }

        //if (Math.abs(event.clientY - plane.geometry.parameters.width) > plane.geometry.parameters.width){

        //     controls.posY = plane.position.Y;

        // } else {

        //     controls.posY = event.clientY;
        // }
    }


    function activate() {

        //_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        //_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        //_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
        //_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
        //_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.addEventListener('touchend', onDocumentTouchEnd, false);
    }

    function deactivate() {

        //_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        //_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        //_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
        //_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
        //_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);
    }

    function onDocumentTouchStart(event) {

        event.preventDefault();
        event = event.changedTouches[0];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        _intersections.length = 0;

        _raycaster.setFromCamera(_mouse, _camera);
        _raycaster.intersectObjects(_objects, true, _intersections);

        if (_intersections.length > 0) {

            _selected = (scope.transformGroup === true) ? _objects[0] : _intersections[0].object;

            _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _worldPosition.setFromMatrixPosition(_selected.matrixWorld));

            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                _inverseMatrix.getInverse(_selected.parent.matrixWorld);
                _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));

            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent({ type: 'dragstart', object: _selected });

        }


    }

    function onDocumentTouchEnd(event) {

        event.preventDefault();

        if (_selected) {

            scope.dispatchEvent({ type: 'dragend', object: _selected });

            _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }
}
