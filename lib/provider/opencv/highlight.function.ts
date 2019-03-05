import * as cv from "opencv4nodejs";
import { CV_8UC4 } from "opencv4nodejs";
import { Point } from "../../point.class";
import { Region } from "../../region.class";
import { ScreenAction } from "../native/robotjs-screen-action.class";

const screenAction = new ScreenAction();

export const highlight = async (target: Point | Region, duration: number = 750) => {
  const screenShot = await screenAction.grabScreen();
  const screenImage = new cv.Mat(screenShot.data, screenShot.height, screenShot.width, CV_8UC4);
  let targetRect: cv.Rect;
  if (target instanceof Point) {
    const p = target as Point;
    targetRect = new cv.Rect(p.x - 2, p.y - 2, 5, 5);
  } else {
    const r = target as Region;
    targetRect = new cv.Rect(r.left, r.top, r.width, r.height);
  }
  cv.drawDetection(screenImage, targetRect, {
    color: new cv.Vec3(0, 0, 255),
    lineType: cv.LINE_4,
    thickness: 5,
  });
  cv.imshow("highlight", screenImage);
  cv.waitKey(duration);
  cv.destroyAllWindows();
};
