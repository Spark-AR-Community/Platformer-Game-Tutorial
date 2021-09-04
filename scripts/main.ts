import Scene from 'Scene';
import Diagnostics from 'Diagnostics';
import Reactive from 'Reactive';
import Animation from 'Animation';
import Patches from 'Patches';
import FaceTracking from 'FaceTracking';
import FaceGestures from 'FaceGestures';
import CameraInfo from 'CameraInfo';
import Random from 'Random';
import Time from 'Time';

import { Player, EnemyObject } from './players';
import { checkCollisionsBetweenTwoRectangles } from './utils';

/**
 * Most things here are likely to change!!!
 * But these should be the same basic mechanics that will be used on the final version
 */

(async function () {
  // Rectangle
  const playerObject = (await Scene.root.findFirst('playerObject')) as PlanarObject;
  const enemies = (await Scene.root.findByPath('**/bad*')) as PlanarObject[];

  // Store the 0th (first) FaceTracking Face as a variable
  // This "Face" object (assigned to the face0 var), contains all the FaceTracking data you'd
  // have access to in the Patch editor. E.g.: face0.nose
  const face0 = FaceTracking.face(0);

  // Create a Player instance
  const player = new Player(playerObject);
  // bind the player to the face
  player.bindPlayerToFace(face0);

  // Store all enemy instances as an array
  const enemyInstances = [];

  // Create new Enemies & store them as part of the array
  enemies.forEach((enemy) => {
    // Create an Enemy
    const enemyInstance = new EnemyObject(enemy);
    // Randomize & animate
    enemyInstance.randomizeXPosition();
    // 2000ms, 100% randomization
    enemyInstance.animateYPosition(2000, 1);

    // push to array
    enemyInstances.push(enemyInstance);
  });

  // Use an Array map + Reactive.orList to check for ANY collision between an enemy & the player
  const isThereACollision = Reactive.orList(
    enemyInstances.map((enemy) => checkCollisionsBetweenTwoRectangles(player.body, enemy.body)),
  );

  // Display
  const twoDText = (await Scene.root.findFirst('2dText0')) as PlanarText;
  twoDText.text = isThereACollision.ifThenElse('colliding', 'nope, keep trying');
})();
