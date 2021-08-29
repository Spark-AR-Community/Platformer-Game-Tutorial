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

import { checkCollisionsBetweenTwoRectangles } from './utils';

/**
 * Most things here are likely to change!!!
 * But these should be the same basic mechanics that will be used on the final version
 */

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

    // Center the obj -- Ignore this bit till we figure something better
    playerObject.transform.y = heightOfTheScreen.div(2).sub(playerObject.height.div(2));

    // (Needs to be improved) 
    const objsAreColliding = checkCollisionsBetweenTwoRectangles(playerObject, badObj0); // @ts-ignore
    (await Scene.root.findFirst('2dText0')).text = objsAreColliding.ifThenElse('Colliding', 'nope, keep trying');

    badObj0.transform.x = Reactive.val(Random.random()).mul(widthOfTheScreen);

    // This can/should be broken into smaller more digestible pieces
    const TimeDriver = Animation.timeDriver({
        durationMilliseconds: 2000,
        loopCount: Infinity,
        mirror: false
    });

    // Make a signal that goes from 0-1 over the course of 2000ms (see TimeDriver)
    let animY = Animation.animate(TimeDriver, Animation.samplers.linear(0,1));
    // Make the animated value go from (-objHeight) to (objHeight + screenSize)
    animY = animY
            .mul(heightOfTheScreen.add(badObj0.height))
            .sub(badObj0.height);

    // Change the Y position of the object
    badObj0.transform.y = animY;

    // Start the TimeDriver/animate the signal
    TimeDriver.start();

    // When the signal completes a loop, then... 👇
    TimeDriver.onAfterIteration().subscribe(()=>{
        // 👇
        // Change the X position, making it so the objects don't always fall across the portion of the screen
        badObj0.transform.x = Reactive.val(Random.random()).mul(widthOfTheScreen);
    });

})();
