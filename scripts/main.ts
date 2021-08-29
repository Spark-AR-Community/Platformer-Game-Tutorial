import Scene from 'Scene';
import Diagnostics from 'Diagnostics';
import Reactive from 'Reactive';
import Animation from 'Animation';
import Patches from 'Patches';
import FaceTracking from 'FaceTracking';
import FaceGestures from 'FaceGestures';
import CameraInfo from 'CameraInfo';
import Random from 'Random';
import Time from 'Time'; // i promise it's not what you're thinking

import { checkCollisionsBetweenTwoRectangles } from './utils';

(async function () {
    // Rectangle
    const playerObject = await Scene.root.findFirst('playerObject') as PlanarObject;
    const badObj0 = await Scene.root.findFirst('bad0') as PlanarObject;

    // Face 0
    const face0 = FaceTracking.face(0);

    // Screen size
    const widthOfTheScreen = CameraInfo.previewSize.x.div(CameraInfo.previewScreenScale);
    const heightOfTheScreen = CameraInfo.previewSize.y.div(CameraInfo.previewScreenScale);
    
    // Smooth out the signal -- reduce noise & make an 'acceleration' effect
    let heading = face0.cameraTransform.rotationY.expSmooth(100);

    // Take the signal, and transform it into the 0-1 range
    heading = heading.fromRange(-0.5, 0.5);

    // Prevent it from going over the 0-1 range
    heading = heading.clamp(0,1);

    // Make the 0-1 signal go from 0 to the max width of the screen
    heading = heading.mul(widthOfTheScreen);

    // Prevent the rectangle from going over the borders of the screen
    heading = heading.mul(Reactive.sub(1, playerObject.width.div(widthOfTheScreen)));

    // Assign it to the obj
    playerObject.transform.x = heading;

    // Ignore this bit till we figure something better lol
    playerObject.transform.y = heightOfTheScreen.div(2).sub(playerObject.height.div(2));

    //  ¯\_(ツ)_/¯
    const objsAreColliding = checkCollisionsBetweenTwoRectangles(playerObject, badObj0); // @ts-ignore
    (await Scene.root.findFirst('2dText0')).text = objsAreColliding.ifThenElse('Colliding', 'nope, keep trying');

    // You have to be kidding me why does the Random module return a NUMBER
    // what's the point of the random module???? Lmao
    badObj0.transform.x = Reactive.val(Random.random()).mul(widthOfTheScreen);

    // This can/should be broken into smaller more digestible pieces
    const anim = Animation.timeDriver({durationMilliseconds: 2000, loopCount: Infinity, mirror: false});
    badObj0.transform.y = Animation.animate(anim, Animation.samplers.linear(0,1)).mul(heightOfTheScreen.add(badObj0.height)).sub(badObj0.height);
    anim.start();
    anim.onAfterIteration().subscribe(()=>badObj0.transform.x = Reactive.val(Random.random()).mul(widthOfTheScreen));
})();
