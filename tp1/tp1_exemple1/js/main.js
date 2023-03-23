let canvas;
let engine;
let scene;
let camera;

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);

    scene = createScene();

    let sphere = scene.getMeshByName("mySphere");

    // main animation loop 60 times/s
    engine.runRenderLoop(() => {
        scene.render();

        // move the sphere on event click 
        sphere.BABYLON

        
        
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    
    // background
    scene.clearColor = new BABYLON.Color3(1, 0, 1);
    // Create some objects 
    // params = number of horizontal "stripes", diameter...
    let sphere = BABYLON.MeshBuilder.CreateSphere("mySphere", {diameter: 2, segments: 32}, scene);
    sphere.position.y = 1;
    //sphere.attachControl(canvas);
    // create cylindre
    let cylindre = BABYLON.MeshBuilder.CreateCylinder("myCylindre", {diameter: 2, height: 4, tessellation: 32}, scene);
    cylindre.position.y = 2;
    cylindre.position.x = 5;
    //create rectangle 
    let rectangle = BABYLON.MeshBuilder.CreateBox("myRectangle", {width: 2, height: 2, depth: 2}, scene);
    rectangle.position.y=2;
    rectangle.position.x = 10;
    // a plane
    let ground = BABYLON.MeshBuilder.CreateGround("myGround", {width: 60, height: 60}, scene);
    //console.log(ground.name);

     camera = new BABYLON.FreeCamera("myCamera", new BABYLON.Vector3(0, 5, -10), scene);
   // This targets the camera to scene origin
   camera.setTarget(BABYLON.Vector3.Zero());
   //camera.rotation.y = 0.3;
   camera.attachControl(canvas);
   
    let light = new BABYLON.HemisphericLight("myLight", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.3;
    // color of the light
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    return scene;
}

window.addEventListener("resize", () => {
    engine.resize()
})

