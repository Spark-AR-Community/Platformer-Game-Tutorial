import Scene from 'Scene';
import Diagnostics from 'Diagnostics';
import Reactive from 'Reactive'

export function checkCollisionsBetweenTwoRectangles(a: PlanarObject, b: PlanarObject){
    return Reactive.abs(a.transform.position.x.sub(b.transform.position.x))
    .le(Reactive.add(a.width.div(2), b.width.div(2)))
    // Same but for the Y axis
    .and(
    Reactive.abs(a.transform.position.y.sub(b.transform.position.y))
    .le(Reactive.add(a.height.div(2), b.height.div(2)))
    );
};