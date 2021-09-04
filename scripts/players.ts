import Reactive from 'Reactive';
import CameraInfo from 'CameraInfo';
import Random from 'Random';
import Animation from 'Animation';

import { checkCollisionsBetweenTwoRectangles } from './utils';

// Screen size
const widthOfTheScreen = CameraInfo.previewSize.x.div(
  CameraInfo.previewScreenScale,
);
const heightOfTheScreen = CameraInfo.previewSize.y.div(
  CameraInfo.previewScreenScale,
);

/**
 * A class used to control & animate a player controlled object
 */
export class Player {
  body: PlanarObject;
  constructor(body: PlanarObject) {
    // If the body parameter was not provided, throw an error
    if (!body) throw new Error(`@ Player.constructor (new Player()): 'body' parameter was not provided`);
    // Otherwise.. store it as part of the current class instance
    this.body = body;
  }
  /**
   * @description This method binds the current class body to a Face
   * @param face The "face" parameter will provide us with the data needed to move the "body" around (follow the face)
   */
  bindPlayerToFace(face: Face) {
    // If the face parameter was not provided, throw an error
    if (!face) throw new Error(`@ Player.bindPlayerToFace: 'face' parameter was not provided`);
    // Otherwise.. keep executing 👇

    // Smooth out the face rotation signal signal -- reduce noise & make a fake 'acceleration' effect
    let xPosition = face.cameraTransform.rotationY.expSmooth(100);

    // Take the signal, and transform it into the 0-1 range
    xPosition = xPosition.fromRange(-0.5, 0.5);

    // Prevent it from going over the 0-1 range
    xPosition = xPosition.clamp(0, 1);

    // Make the 0-1 signal go from 0 to the max width of the screen
    xPosition = xPosition.mul(widthOfTheScreen);

    // Prevent the rectangle from going over the borders of the screen
    xPosition = xPosition.mul(
      Reactive.sub(1, this.body.width.div(widthOfTheScreen)),
    );

    // Assign it to the obj
    this.body.transform.x = xPosition;

    // @todo Center the obj -- Ignore this bit till we figure something better
    this.body.transform.y = heightOfTheScreen
      .div(2)
      .sub(this.body.height.div(2));
  }
}

/**
 * A class that is used to simplify creating and animating Enemy/bad objects
 */
export class EnemyObject {
  body: PlanarObject;
  constructor(body: PlanarObject) {
    this.body = body;
  }
  randomizeXPosition() {
    const randomNum = Random.random();
    this.body.transform.x = Reactive.val(randomNum).mul(widthOfTheScreen);
  }
  animateYPosition(ms: number, randomizeBy: number) {
    if (!ms) throw new Error(`@EnemyObject.animateYPosition: the ms parameter was not provided`);
    if (!randomizeBy) throw new Error(`@EnemyObject.animateYPosition: the randomizeBy parameter was not provided`);

    const TimeDriver = Animation.timeDriver({
      durationMilliseconds: ms + ms * Random.random() * randomizeBy,
      loopCount: Infinity,
      mirror: false,
    });

    // Make a signal that goes from 0-1 over the course of #ms (see TimeDriver)
    let animatedY = Animation.animate(
      TimeDriver,
      Animation.samplers.linear(0, 1),
    );

    const randomVariance = Reactive.val(Random.random()).mul(
      heightOfTheScreen.mul(randomizeBy),
    );

    // Make the animated value go from (-objHeight) to (objHeight + screenSize)
    animatedY = animatedY
      .mul(heightOfTheScreen.add(this.body.height).add(randomVariance))
      .sub(this.body.height.add(randomVariance));

    // Change the Y position of the object
    this.body.transform.y = animatedY;

    // Start the TimeDriver/animate the signal
    TimeDriver.start();

    // When the signal completes a loop, then execute the randomizeXPosition function... 👇
    TimeDriver.onAfterIteration().subscribe(this.randomizeXPosition.bind(this));
  }
}
