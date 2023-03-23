import Dude from "./Dude.js";

let canvas;
let engine;
let scene;
window.onload = startGame;

function startGame() {
  canvas = document.querySelector("#myCanvas");
  engine = new BABYLON.Engine(canvas, true);
  scene = createScene();

  // enable physics
  scene.enablePhysics();

  // modify some default settings (i.e pointer events to prevent cursor to go
  // out of the game window)
  modifySettings();

  let tank = scene.getMeshByName("heroTank");

  scene.toRender = () => {
    let deltaTime = engine.getDeltaTime(); // remind you something ?

    tank.move();
    tank.fireCannonBalls(); // will fire only if space is pressed !
    tank.fireLasers(); // will fire only if l is pressed !

    moveHeroDude();
    moveOtherDudes();

    scene.render();
  };

  //engine.runRenderLoop();
  // instead of running the game, we tell instead the asset manager to load.
  // when finished it will execute its onFinish callback that will run the loop
  scene.assetsManager.load();
}

function createScene() {
  let scene = new BABYLON.Scene(engine);

  scene.assetsManager = configureAssetManager(scene);

  let ground = createGround(scene);
  //let freeCamera = createFreeCamera(scene);
  const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  const physicsPlugin = new BABYLON.CannonJSPlugin();
 scene.enablePhysics(gravityVector, physicsPlugin);

  // Génération des positions de maison sur une grille
  const houseSpacing = 100;
  const numberOfRows = 5;
  const numberOfColumns = 5;

  const housePositions = [];

  for (let i = 0; i < numberOfRows; i++) {
    for (let j = 0; j < numberOfColumns; j++) {
      housePositions.push({
        position: new BABYLON.Vector3((i * houseSpacing) - (numberOfRows * houseSpacing) / 2, 0, (j * houseSpacing) - (numberOfColumns * houseSpacing) / 2),
        rotationY: 0,
        scaling: new BABYLON.Vector3(2, 2, 2),
      });
    }
  }



  // Chargement des maisons à partir des modèles et ajout à la scène
  const houseModelPath = {
    folder: "models/",
    file: "House.glb",
  };

  housePositions.forEach(houseData => {
    createHouse(scene, houseModelPath, houseData.position, houseData.scaling, new BABYLON.Vector3(0, houseData.rotationY, 0), house => {
      console.log("Maison chargée et ajoutée à la scène.");
    });
  });


    // Charger le modèle 3D de l'hélicoptère
  const helicopterModelPath = {
    folder: "models/",
    file: "helipainter.glb"
  };

  // Fonction pour créer et animer un hélicoptère
  function createAndAnimateHelicopter(scene, modelPath, position, scaling) {
    BABYLON.SceneLoader.ImportMesh("", modelPath.folder, modelPath.file, scene, function (meshes) {
      const helicopter = meshes[0];
      helicopter.position = position.clone();
      helicopter.scaling = scaling;
  
      // Appliquer la rotation pour inverser l'hélicoptère
      const yAxis = new BABYLON.Vector3(0, 1, 0); // L'axe Y
      helicopter.rotate(yAxis, Math.PI, BABYLON.Space.LOCAL);
  
      // Animer l'hélicoptère
      const randomX = Math.random() * 50 - 25;
      const randomY = Math.random() * 20 + 20;
      const randomZ = Math.random() * 50 + 1000;
  
      const targetPosition = new BABYLON.Vector3(position.x + randomX, position.y + randomY, position.z + randomZ);
      const animationTime = 350;
  
      const animation = new BABYLON.Animation("helicopterAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
  
      // Création de clés pour l'animation
      const keys = [];
      keys.push({
        frame: 0,
        value: helicopter.position
      });
      keys.push({
        frame: animationTime,
        value: targetPosition
      });
  
      // Affectation des clés à l'animation
      animation.setKeys(keys);
  
      // Ajout de l'animation à l'hélicoptère
      helicopter.animations = [animation];
  
      // Démarrage de l'animation
      scene.beginAnimation(helicopter, 0, animationTime, true);
    });
  }
  
  
  


// Créer plusieurs instances d'hélicoptères et les animer
const helicopterScaling = new BABYLON.Vector3(50, 50, 50); // Changer ces valeurs pour ajuster l'échelle du modèle

// Créer plusieurs instances d'hélicoptères et les animer
  const numHelicopters = 3;
  for (let i = 0; i < numHelicopters; i++) {
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 20 + 30;
      const randomZ = Math.random() * 100 - 50;
      
      const startPosition = new BABYLON.Vector3(randomX, randomY, randomZ);
      createAndAnimateHelicopter(scene, helicopterModelPath, startPosition, helicopterScaling);
  }







  let tankModelPath = "models/tank/source/cyber_tank_futuristiccyberpunk.glb"; // Remplacez ceci par le chemin de votre modèle de tank
    let tank = createTank(scene, tankModelPath, (loadedTank) => {
    console.log("ca bien charger.");
    });

  // second parameter is the target to follow
  scene.followCameraTank = createFollowCamera(scene, tank);
  scene.activeCamera = scene.followCameraTank;

  scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Création d'une lumière directionnelle pour une illumination générale faible
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -1, -1), scene);
    dirLight.intensity = 0.3;

    // Création de quelques lumières ponctuelles pour mettre en évidence certaines zones
    const pointLight1 = new BABYLON.PointLight("pointLight1", new BABYLON.Vector3(10, 10, 0), scene);
    pointLight1.intensity = 0.8;
    pointLight1.range = 50;

    const pointLight2 = new BABYLON.PointLight("pointLight2", new BABYLON.Vector3(-10, 10, 0), scene);
    pointLight2.intensity = 0.8;
    pointLight2.range = 50;

    const pointLight3 = new BABYLON.PointLight("pointLight3", new BABYLON.Vector3(0, 10, 10), scene);
    pointLight3.intensity = 0.8;
    pointLight3.range = 50;

  createHeroDude(scene); // we added the creation of a follow camera for the dude

  loadSounds(scene);

  //scene.debugLayer.show();

  return scene;
}
let houseArray = [];
function createHouse(scene, modelPath, position, scaling, rotation, onHouseLoaded) {
  BABYLON.SceneLoader.ImportMesh("", modelPath.folder, modelPath.file, scene, function (meshes) {
      const importedHouse = meshes[0];
      importedHouse.position = position;
      importedHouse.scaling = scaling;
      importedHouse.rotation = rotation;

      // Activer les collisions pour tous les objets importés
      meshes.forEach(mesh => {
          mesh.checkCollisions = true;
      });

      // Créer une boîte de collision invisible
      const boundingBox = importedHouse.getBoundingInfo().boundingBox;
      const size = boundingBox.maximumWorld.subtract(boundingBox.minimumWorld).multiplyByFloats(100, 100, 100);
      const collisionBox = BABYLON.MeshBuilder.CreateBox("collisionBox", { width: size.x, height: size.y, depth: size.z }, scene);
      collisionBox.position = position;
      collisionBox.checkCollisions = true;
      collisionBox.isVisible = true; // Rendre la boîte de collision invisible

      onHouseLoaded(importedHouse);
      importedHouse.health = 100;
      houseArray.push(importedHouse);
  });
}








function configureAssetManager(scene) {
  // useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
  scene.assets = {};

  let assetsManager = new BABYLON.AssetsManager(scene);

  assetsManager.onProgress = function (
    remainingCount,
    totalCount,
    lastFinishedTask
  ) {
    engine.loadingUIText =
      "We are loading the scene. " +
      remainingCount +
      " out of " +
      totalCount +
      " items still need to be loaded.";
    console.log(
      "We are loading the scene. " +
      remainingCount +
      " out of " +
      totalCount +
      " items still need to be loaded."
    );
  };

  assetsManager.onFinish = function (tasks) {
    engine.runRenderLoop(function () {
      scene.toRender();
    });
  };

  return assetsManager;
}

function loadSounds(scene) {
  var assetsManager = scene.assetsManager;

  var binaryTask = assetsManager.addBinaryFileTask("laserSound", "sounds/laser.wav");
  binaryTask.onSuccess = function (task) {
    scene.assets.laserSound = new BABYLON.Sound("laser", task.data, scene, null,
      { loop: false, spatialSound: true }
    );
  };

  binaryTask = assetsManager.addBinaryFileTask("cannonSound", "sounds/cannonBlast.mp3");
  binaryTask.onSuccess = function (task) {
    scene.assets.cannonSound = new BABYLON.Sound(
      "cannon",
      task.data,
      scene,
      null,
      { loop: false, spatialSound: true }
    );
  };

  binaryTask = assetsManager.addBinaryFileTask("dieSound", "sounds/dying.wav");
  binaryTask.onSuccess = function (task) {
    scene.assets.dieSound = new BABYLON.Sound("die", task.data, scene, null, {
      loop: false,
      spatialSound: true
    });
  };

  binaryTask = assetsManager.addBinaryFileTask("gunSound", "sounds/shot.wav");
  binaryTask.onSuccess = function (task) {
    scene.assets.gunSound = new BABYLON.Sound("gun", task.data, scene, null, {
      loop: false,
    });
  };

  binaryTask = assetsManager.addBinaryFileTask("explosion","sounds/explosion.mp3");
  binaryTask.onSuccess = function (task) {
    scene.assets.explosion = new BABYLON.Sound(
      "explosion",
      task.data,
      scene,
      null,
      { loop: false, spatialSound: true }
    );
  };

  binaryTask = assetsManager.addBinaryFileTask("pirates", "sounds/pirateFun.mp3");
  binaryTask.onSuccess = function (task) {
    scene.assets.pirateMusic = new BABYLON.Sound(
      "piratesFun",
      task.data,
      scene,
      null,
      {
        loop: true,
        autoplay: true,
      }
    );
  };
}

function loadCrossHair(scene) {
  var crossHair = new BABYLON.Mesh.CreateBox("crossHair", .1, scene);
  crossHair.parent = scene.freeCameraDude;
  //console.log("minZ is " + scene.freeCameraDude.minZ);
  //  scene.freeCameraDude.minZ = .1;
  //  crossHair.position.z += 0.2;
  crossHair.position.z += 2;

  // strange....?
  //impact.position.y -= scene.freeCameraDude.ellipsoidOffset.y;
  crossHair.material = new BABYLON.StandardMaterial("crossHair", scene);
  crossHair.material.diffuseTexture = new BABYLON.Texture("images/gunaims.png", scene);
  crossHair.material.diffuseTexture.hasAlpha = true;
  crossHair.isPickable = false;
}

function createGround(scene) {
  const groundOptions = {
    width: 2000,
    height: 2000,
    subdivisions: 20,
    minHeight: 0,
    maxHeight: 100,
    onReady: onGroundCreated,
  };
  //scene is optional and defaults to the current scene
  const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "gdhm",
    "images/hmap1.png",
    groundOptions,
    scene
  );

  function onGroundCreated() {
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseTexture = new BABYLON.Texture("images/sol.png");
    ground.material = groundMaterial;
    // to be taken into account by collision detection
    ground.checkCollisions = true;
    //groundMaterial.wireframe=true;

    // for physic engine
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.HeightmapImpostor,
      { mass: 0 },
      scene
    );

  }
  return ground;
}

function createLights(scene) {
  // i.e sun light with all light rays parallels, the vector is the direction.
  let light0 = new BABYLON.DirectionalLight(
    "dir0",
    new BABYLON.Vector3(-1, -1, 0),
    scene
  );
}

function createFreeCamera(scene, initialPosition) {
  let camera = new BABYLON.FreeCamera("freeCamera", initialPosition, scene);
  camera.attachControl(canvas);
  // prevent camera to cross ground
  camera.checkCollisions = true;
  // avoid flying with the camera
  camera.applyGravity = true;

  // Make it small as we're going to put in on top of the Dude
  camera.ellipsoid = new BABYLON.Vector3(.1, .1, .1); // very small ellipsoid/sphere 
  camera.ellipsoidOffset.y = 4;
  // Add extra keys for camera movements
  // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
  camera.keysUp.push("z".charCodeAt(0));
  camera.keysDown.push("s".charCodeAt(0));
  camera.keysLeft.push("q".charCodeAt(0));
  camera.keysRight.push("d".charCodeAt(0));
  camera.keysUp.push("Z".charCodeAt(0));
  camera.keysDown.push("S".charCodeAt(0));
  camera.keysLeft.push("Q".charCodeAt(0));
  camera.keysRight.push("D".charCodeAt(0));

  return camera;
}

function createFollowCamera(scene, target) {
  let targetName = target.name;

  // use the target name to name the camera
  let camera = new BABYLON.FollowCamera(
    targetName + "FollowCamera",
    target.position,
    scene,
    target
  );

  // default values
  camera.radius = 60; // how far from the object to follow
  camera.heightOffset = 14; // how high above the object to place the camera
  camera.rotationOffset = 0; // the viewing angle
  camera.cameraAcceleration = 0.1; // how fast to move
  camera.maxCameraSpeed = 5; // speed limit

  // specific values
  switch (target.name) {
    case "heroDude":
      camera.rotationOffset = 0;
      break;
    case "heroTank":
      camera.rotationOffset = 180; // the viewing angle
      break;
  }

  return camera;
}

let zMovement = 5;
function createTank(scene, modelName, onModelLoaded) {
  let tank = new BABYLON.Mesh("heroTank", scene);
  tank.position.y = 2;
  tank.speed = 1;
  tank.frontVector = new BABYLON.Vector3(0, 0, 1);

  tank.move = () => {
    if (scene.activeCamera !== scene.followCameraTank) return;
    //tank.position.z += -1; // speed should be in unit/s, and depends on
    // deltaTime !

    // if we want to move while taking into account collision detections
    // collision uses by default "ellipsoids"

    let yMovement = 0;

    if (tank.position.y > 3) {
      zMovement = 0;
      yMovement = -3;
    }


    // adjusts y position depending on ground height...
    // create a ray that starts above the dude, and goes down vertically
    let origin = new BABYLON.Vector3(tank.position.x, 1000, tank.position.z);
    let direction = new BABYLON.Vector3(0, -5, 0);
    let ray = new BABYLON.Ray(origin, direction, 10000);

    // compute intersection point with the ground
    let pickInfo = scene.pickWithRay(ray, (mesh) => { return (mesh.name === "gdhm"); });
    let groundHeight = pickInfo.pickedPoint.y;
    tank.position.y = groundHeight+2;

    //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

    if (scene.inputStates.up) {
      //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
      tank.moveWithCollisions(
        tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed)
      );
    }
    if (scene.inputStates.down) {
      //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
      tank.moveWithCollisions(
        tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed)
      );
    }
    if (scene.inputStates.left) {
      //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
      tank.rotation.y -= 0.02;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
    if (scene.inputStates.right) {
      //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
      tank.rotation.y += 0.02;
      tank.frontVector = new BABYLON.Vector3(
        Math.sin(tank.rotation.y),
        0,
        Math.cos(tank.rotation.y)
      );
    }
  };

  // to avoid firing too many cannonball rapidly
  tank.canFireCannonBalls = true;
  tank.fireCannonBallsAfter = 1.5; // in seconds

  tank.fireCannonBalls = function () {
    if (!scene.inputStates.space) return;

    if (!this.canFireCannonBalls) return;

    // ok, we fire, let's put the above property to false
    this.canFireCannonBalls = false;

    // let's be able to fire again after a while
    setTimeout(() => {
      this.canFireCannonBalls = true;
    }, 1000 * this.fireCannonBallsAfter);

    scene.assets.cannonSound.setPosition(tank.position);
    scene.assets.cannonSound.setVolume(0.5);
    scene.assets.cannonSound.play();
    // Shake the camera
    const shakeDuration = 0.2; // Duration in seconds
    const shakeIntensity = 3; // Intensity of the shake
    shakeCamera(scene, scene.activeCamera, shakeDuration, shakeIntensity);


    // Create a canonball
    let cannonball = BABYLON.MeshBuilder.CreateSphere(
      "cannonball",
      { diameter: 1, segments: 15 },
      scene
    );
    cannonball.material = new BABYLON.StandardMaterial("Fire", scene);
    cannonball.material.diffuseTexture = new BABYLON.Texture(
      "images/black.png",
      scene
    );

    let pos = this.position;
    // position the cannonball above the tank
    cannonball.position = new BABYLON.Vector3(pos.x, pos.y-1, pos.z);
    // move cannonBall position from above the center of the tank to above a bit further than the frontVector end (5 meter s further)
    cannonball.position.addInPlace(this.frontVector.multiplyByFloats(5, 5, 5));

    // add physics to the cannonball, mass must be non null to see gravity apply
    cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(
      cannonball,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene
    );

    // the cannonball needs to be fired, so we need an impulse !
    // we apply it to the center of the sphere
    let powerOfFire = 100;
    let azimuth = 0.1;
    let aimForceVector = new BABYLON.Vector3(
      this.frontVector.x * powerOfFire,
      (this.frontVector.y + azimuth) * powerOfFire,
      this.frontVector.z * powerOfFire
    );

    cannonball.physicsImpostor.applyImpulse(aimForceVector, cannonball.getAbsolutePosition());

    cannonball.actionManager = new BABYLON.ActionManager(scene);


    // register an action for when the cannonball intesects a dude, so we need to iterate on each dude
    scene.dudes.forEach((dude) => {
      cannonball.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: dude.Dude.bounder,
          }, // dude is the mesh, Dude is the instance if Dude class that has a bbox as a property named bounder.
          // see Dude class, line 16 ! dudeMesh.Dude = this;
          () => {
            // console.log(dude.Dude.bounder)
            if (dude.Dude.bounder._isDisposed) return;

            //console.log("HIT !")
            //dude.Dude.bounder.dispose();
            //dude.dispose();
            dude.Dude.gotKilled();
            //cannonball.dispose(); // don't work properly why ? Need for a closure ?
          }
        )
      );
    });


    // Make the cannonball disappear after 3s
    setTimeout(() => {
      cannonball.dispose();
    }, 3000);
  };

  // to avoid firing too many cannonball rapidly
  tank.canFireLasers = true;
  tank.fireLasersAfter = 0.3; // in seconds

  tank.fireLasers = function () {
    // is the l key pressed ?
    if (!scene.inputStates.laser) return;

    if (!this.canFireLasers) return;

    // ok, we fire, let's put the above property to false
    this.canFireLasers = false;

    // let's be able to fire again after a while
    setTimeout(() => {
      this.canFireLasers = true;
    }, 1000 * this.fireLasersAfter);

    scene.assets.laserSound.setPosition(tank.position);
    scene.assets.laserSound.setVolume(0.6);
    scene.assets.laserSound.play();

    //console.log("create ray")
    // create a ray
    let origin = this.position; // position of the tank
    //let origin = this.position.add(this.frontVector);

    // Looks a little up (0.1 in y)
    let direction = new BABYLON.Vector3(
      this.frontVector.x,
      this.frontVector.y + 0.1,
      this.frontVector.z
    );
    let length = 1000;
    let ray = new BABYLON.Ray(origin, direction, length);

    // to make the ray visible :
    let rayHelper = new BABYLON.RayHelper(ray);
    //rayHelper.show(scene, new BABYLON.Color3.Red());

    // to make ray disappear after 200ms
    setTimeout(() => {
      rayHelper.hide(ray);
    }, 200);

    // what did the ray touched?
    /*
        let pickInfo = scene.pickWithRay(ray);
        // see what has been "picked" by the ray
        console.log(pickInfo);
        */

    // See also multiPickWithRay if you want to kill "through" multiple objects
    // this would return an array of boundingBoxes.... instead of one.

    let pickInfo = scene.pickWithRay(ray, (mesh) => {
      /*
            if((mesh.name === "heroTank")|| ((mesh.name === "ray"))) return false;
            return true;
            */
      return mesh.name.startsWith("bounder");
    });

    if (pickInfo.pickedMesh) {
      // sometimes it's null for whatever reason...?
      // the mesh is a bounding box of a dude
      console.log(pickInfo.pickedMesh.name);
      let bounder = pickInfo.pickedMesh;
      let dude = bounder.dudeMesh.Dude;
      // let's decrease the dude health, pass him the hit point
      dude.decreaseHealth(pickInfo.pickedPoint);

      //bounder.dudeMesh.dispose();
      //bounder.dispose();
    }
  };

  BABYLON.SceneLoader.ImportMesh(
    null,
    "",
    modelName,
    scene,
    function (meshes, particleSystems, skeletons) {
      let importedModel = meshes[0];
      importedModel.parent = tank;
      importedModel.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL); // Utilisez cette ligne à la place
      importedModel.scaling = new BABYLON.Vector3(3, 3, 3);
      if (onModelLoaded) {
        onModelLoaded(tank);
      }
    }
  );

  return tank;
}

function shakeCamera(scene, camera, duration, intensity) {
  const keyFrames = [];
  const numberOfFrames = Math.round(duration * 60);
  const originalPosition = camera.position.clone();

  for (let frame = 0; frame < numberOfFrames; frame++) {
    const offsetX = (Math.random() - 0.5) * intensity;
    const offsetY = (Math.random() - 0.5) * intensity;
    const offsetZ = (Math.random() - 0.5) * intensity;

    const newPosition = originalPosition.add(new BABYLON.Vector3(offsetX, offsetY, offsetZ));

    keyFrames.push({
      frame: frame,
      value: newPosition,
    });
  }

  const cameraAnimation = new BABYLON.Animation(
    "cameraShake",
    "position",
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  cameraAnimation.setKeys(keyFrames);

  scene.beginDirectAnimation(camera, [cameraAnimation], 0, numberOfFrames - 1, false, 1, () => {
    camera.position = originalPosition;
  });
}



function createHeroDude(scene) {
  // load the Dude 3D animated model
  // name, folder, skeleton name
  //BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene, onDudeImported);

  let meshTask = scene.assetsManager.addMeshTask(
    "Dude task",
    "him",
    "models/Dude/",
    "Dude.babylon"
  );

  meshTask.onSuccess = function (task) {
    onDudeImported(
      task.loadedMeshes,
      task.loadedParticleSystems,
      task.loadedSkeletons
    );
  };

  function onDudeImported(newMeshes, particleSystems, skeletons) {
    let heroDude = newMeshes[0];
    heroDude.position = new BABYLON.Vector3(0, 0, 5); // The original dude
    // make it smaller
    //heroDude.speed = 0.1;

    // give it a name so that we can query the scene to get it by name
    heroDude.name = "heroDude";


    // there might be more than one skeleton in an imported animated model. Try console.log(skeletons.length)
    // here we've got only 1.
    // animation parameters are skeleton, starting frame, ending frame,  a boolean that indicate if we're gonna
    // loop the animation, speed,
    // let's store the animatableObject into the main dude mesh
    heroDude.animation = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

    setTimeout(() => {
      heroDude.animation.pause();
    }, 500)
    // params = id, speed, scaling, scene
    let hero = new Dude(heroDude, -1, 1, 0.2, scene);


    // create a follow camera for this mesh
    scene.followCameraDude = createFollowCamera(scene, heroDude);

    // Let's add a free camera on the head of the dude (on top of the bounding box + 0.2)
    let bboxHeightScaled = hero.getBoundingBoxHeightScaled();
    let freeCamPosition = new BABYLON.Vector3(heroDude.position.x,
      heroDude.position.y + bboxHeightScaled + 0.2,
      heroDude.position.z);
    scene.freeCameraDude = createFreeCamera(scene, freeCamPosition);
    // associate a crosshair to this cam, to see where we are aiming
    loadCrossHair(scene);

    // make clones
    scene.dudes = [];
    for (let i = 0; i < 10; i++) {
      scene.dudes[i] = doClone(heroDude, skeletons, i);
      scene.beginAnimation(scene.dudes[i].skeleton, 0, 120, true, 1);

      // Create instance with move method etc.
      // params = speed, scaling, scene
      var temp = new Dude(scene.dudes[i], i, 0.3, 0.2, scene);
      // remember that the instances are attached to the meshes
      // and the meshes have a property "Dude" that IS the instance
      // see render loop then....
    }
    // insert at pos 0, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
    // it will be easier for us to distinguish it later on...
    scene.dudes.unshift(heroDude);
  }
}

function doClone(originalMesh, skeletons, id) {
  let myClone;
  let xrand = Math.floor(Math.random() * 500 - 250);
  let zrand = Math.floor(Math.random() * 500 - 250);

  myClone = originalMesh.clone("clone_" + id);
  myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

  if (!skeletons) return myClone;

  // The mesh has at least one skeleton
  if (!originalMesh.getChildren()) {
    myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
    return myClone;
  } else {
    if (skeletons.length === 1) {
      // the skeleton controls/animates all children, like in the Dude model
      let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
      myClone.skeleton = clonedSkeleton;
      let nbChildren = myClone.getChildren().length;

      for (let i = 0; i < nbChildren; i++) {
        myClone.getChildren()[i].skeleton = clonedSkeleton;
      }
      return myClone;
    } else if (skeletons.length === originalMesh.getChildren().length) {
      // each child has its own skeleton
      for (let i = 0; i < myClone.getChildren().length; i++) {
        myClone.getChildren()[i].skeleton = skeletons[i].clone(
          "clone_" + id + "_skeleton_" + i
        );
      }
      return myClone;
    }
  }

  return myClone;
}

function moveHeroDude() {
  let heroDude = scene.getMeshByName("heroDude");
  if (heroDude) heroDude.Dude.moveFPS(scene);
}

function moveOtherDudes() {
  if (scene.dudes) {
    // start at 1 so the original dude will not move and follow the tank...
    for (var i = 1; i < scene.dudes.length; i++) {
      scene.dudes[i].Dude.followTank(scene);
    }
  }
}

window.addEventListener("resize", () => {
  engine.resize();
});

function modifySettings() {
  // as soon as we click on the game window, the mouse pointer is "locked"
  // you will have to press ESC to unlock it
  scene.onPointerDown = () => {
    if (!scene.alreadyLocked) {
      console.log("requesting pointer lock");
      canvas.requestPointerLock();
    } else {
      console.log("Pointer already locked");
      
      if(scene.activeCamera === scene.freeCameraDude) {
        // let fire the gun
        let heroDude = scene.getMeshByName("heroDude");
        if (heroDude) heroDude.Dude.fireGun();
      }
    }
  };

  document.addEventListener("pointerlockchange", () => {
    let element = document.pointerLockElement || null;
    if (element) {
      // lets create a custom attribute
      scene.alreadyLocked = true;
    } else {
      scene.alreadyLocked = false;
    }
  });

  // key listeners for the tank
  scene.inputStates = {};
  scene.inputStates.left = false;
  scene.inputStates.right = false;
  scene.inputStates.up = false;
  scene.inputStates.down = false;
  scene.inputStates.space = false;
  scene.inputStates.laser = false;

  //add the listener to the main, window object, and update the states
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        scene.inputStates.left = true;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "z" ||
        event.key === "Z"
      ) {
        scene.inputStates.up = true;
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        scene.inputStates.right = true;
      } else if (
        event.key === "ArrowDown" ||
        event.key === "s" ||
        event.key === "S"
      ) {
        scene.inputStates.down = true;
      } else if (event.key === " ") {
        scene.inputStates.space = true;
      } else if (event.key === "l" || event.key === "L") {
        scene.inputStates.laser = true;
      } else if (event.key == "t" || event.key == "T") {
        scene.activeCamera = scene.followCameraTank;
      } else if (event.key == "y" || event.key == "Y") {
        scene.activeCamera = scene.followCameraDude;
      } else if (event.key == "u" || event.key == "U") {
        scene.activeCamera = scene.freeCameraDude;
      }
    },
    false
  );

  //if the key will be released, change the states object
  window.addEventListener(
    "keyup",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        scene.inputStates.left = false;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "z" ||
        event.key === "Z"
      ) {
        scene.inputStates.up = false;
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        scene.inputStates.right = false;
      } else if (
        event.key === "ArrowDown" ||
        event.key === "s" ||
        event.key === "S"
      ) {
        scene.inputStates.down = false;
      } else if (event.key === " ") {
        scene.inputStates.space = false;
      } else if (event.key === "l" || event.key === "L") {
        scene.inputStates.laser = false;
      }
    },
    false
  );
}
