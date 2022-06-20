function init() {

    var trackingMethod = location.search.substring(1) ? location.search.substring(1) : 'best'


    //////////////////////////////////////////////////////////////////////////////////
    //		Init
    //////////////////////////////////////////////////////////////////////////////////

    // init renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    //document.body.appendChild(renderer.domElement);
    document.getElementById("webgl-output").appendChild(renderer.domElement);
    // array of functions for the rendering loop
    var onRenderFcts = [];

    // init scene and camera
    var scene = new THREE.Scene();

    //////////////////////////////////////////////////////////////////////////////////
    //		Initialize the camera
    //////////////////////////////////////////////////////////////////////////////////

    var camera = ARjs.Utils.createDefaultCamera(trackingMethod)
    scene.add(camera)

    ////////////////////////////////////////////////////////////////////////////////
    //          	Set up Arjs.Profile
    ////////////////////////////////////////////////////////////////////////////////

    var arProfile = new ARjs.Profile()
        .sourceWebcam()
        .trackingMethod(trackingMethod)
        // .changeMatrixMode('modelViewMatrix')
        // .changeMatrixMode('cameraTransformMatrix')
        .defaultMarker()
        .checkIfValid()

    //////////////////////////////////////////////////////////////////////////////
    //		build ARjs.Session
    //////////////////////////////////////////////////////////////////////////////

    var arSession = new ARjs.Session({
        scene: scene,
        renderer: renderer,
        camera: camera,
        sourceParameters: arProfile.sourceParameters,
        contextParameters: arProfile.contextParameters
    })
    onRenderFcts.push(function () {
        arSession.update()
    })

    ////////////////////////////////////////////////////////////////////////////////
    //          Create a ARjs.Anchor
    ////////////////////////////////////////////////////////////////////////////////

    var arAnchor = new ARjs.Anchor(arSession, arProfile.defaultMarkerParameters)
    onRenderFcts.push(function () {
        arAnchor.update()
    })

    //////////////////////////////////////////////////////////////////////////////
    //                handle Hit Tester
    //////////////////////////////////////////////////////////////////////////////

    var hitTesting = new ARjs.HitTesting(arSession)
    onRenderFcts.push(function () {
        hitTesting.update(camera, arAnchor.object3d, arAnchor.parameters.changeMatrixMode)
    })

    //////////////////////////////////////////////////////////////////////////////////
    //		add an object to the arAnchor
    //////////////////////////////////////////////////////////////////////////////////
    var arWorldRoot = arAnchor.object3d

    var mesh = new THREE.AxesHelper()
    arWorldRoot.add(mesh)

    // add a torus knot
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = geometry.parameters.height / 2
    arWorldRoot.add(mesh);

    var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5
    arWorldRoot.add(mesh);

    onRenderFcts.push(function (delta) {
        mesh.rotation.x += Math.PI * delta
    })

    //////////////////////////////////////////////////////////////////////////////
    //		DebugUI
    //////////////////////////////////////////////////////////////////////////////

    // create arjsDebugUIContainer if needed
    if (document.querySelector('#arjsDebugUIContainer') === null) {
        var domElement = document.createElement('div')
        domElement.id = 'arjsDebugUIContainer'
        domElement.setAttribute('style', 'position: fixed; bottom: 10px; width:100%; text-align: center; z-index: 1;color: grey;')
        document.body.appendChild(domElement)
    }


    var sessionDebugUI = new ARjs.SessionDebugUI(arSession, null)
    document.querySelector('#arjsDebugUIContainer').appendChild(sessionDebugUI.domElement)

    var anchorDebugUI = new ARjs.AnchorDebugUI(arAnchor)
    document.querySelector('#arjsDebugUIContainer').appendChild(anchorDebugUI.domElement)

    //////////////////////////////////////////////////////////////////////////////////
    //		render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////

    // render the scene
    onRenderFcts.push(function () {
        // Render the see through camera scene
        renderer.clear()

        // render hitTesting pickingPlane - for debug
        var renderHitTestingPickingPlane = true
        if (renderHitTestingPickingPlane && hitTesting._hitTestingPlane) {
            hitTesting._hitTestingPlane.renderDebug(renderer)
        }

        renderer.render(scene, camera);
    })

    // run the rendering loop
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        // call each update function
        onRenderFcts.forEach(function (onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        })
    })


}
