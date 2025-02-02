import * as cv from "opencv4nodejs-prebuilt";
import * as path from "path";
import { Image } from "../../image.class";
import { MatchRequest } from "../../match-request.class";
import { MatchResult } from "../../match-result.class";
import { Region } from "../../region.class";
import { DataSource } from "./data-source.interface";
import { FinderInterface } from "./finder.interface";
import { ImageProcessor } from "./image-processor.class";
import { ImageReader } from "./image-reader.class";

export class TemplateMatchingFinder implements FinderInterface {
  private static scaleStep = 0.5;

  private static async match(haystack: cv.Mat, needle: cv.Mat): Promise<MatchResult> {
    const match = await haystack.matchTemplateAsync(
      needle,
      cv.TM_SQDIFF_NORMED,
    );
    const minMax = await match.minMaxLocAsync();
    return new MatchResult(
      1.0 - minMax.minVal,
      new Region(
        minMax.minLoc.x,
        minMax.minLoc.y,
        Math.min(needle.cols, haystack.cols),
        Math.min(needle.rows, haystack.rows),
      ),
    );
  }

  private static async scale(image: cv.Mat, scaleFactor: number): Promise<cv.Mat> {
    const scaledRows = Math.max(Math.floor(image.rows * scaleFactor), 1.0);
    const scaledCols = Math.max(Math.floor(image.cols * scaleFactor), 1.0);
    return image.resizeAsync(scaledRows, scaledCols, 0, 0, cv.INTER_AREA);
  }

  private static async scaleAndMatchNeedle(
    haystack: cv.Mat,
    needle: cv.Mat,
    debug: boolean = false
  ): Promise<MatchResult> {
    const scaledNeedle = await TemplateMatchingFinder.scale(
      needle,
      TemplateMatchingFinder.scaleStep,
    );
    const matchResult = await TemplateMatchingFinder.match(haystack, scaledNeedle);
    if (debug) {
      this.debugImage(scaledNeedle, "scaled_needle.png");
    }
    return new MatchResult(
      matchResult.confidence,
      new Region(
        matchResult.location.left,
        matchResult.location.top,
        needle.cols,
        needle.rows,
      ),
    );
  }

  private static determineScaledSearchRegion(matchRequest: MatchRequest): Region {
    const searchRegion = matchRequest.searchRegion;
    searchRegion.width *= matchRequest.haystack.pixelDensity.scaleX;
    searchRegion.height *= matchRequest.haystack.pixelDensity.scaleY;
    return searchRegion;
  }

  private static async scaleAndMatchHaystack(
    haystack: cv.Mat,
    needle: cv.Mat,
    debug: boolean = false
  ): Promise<MatchResult> {
    const scaledHaystack = await TemplateMatchingFinder.scale(
      haystack,
      TemplateMatchingFinder.scaleStep,
    );
    const matchResult = await TemplateMatchingFinder.match(scaledHaystack, needle);
    if (debug) {
      this.debugImage(scaledHaystack, "scaled_haystack.png");
    }
    return new MatchResult(
      matchResult.confidence,
      new Region(
        matchResult.location.left / TemplateMatchingFinder.scaleStep,
        matchResult.location.top / TemplateMatchingFinder.scaleStep,
        needle.cols,
        needle.rows,
      ),
    );
  }

  private static async debugImage(image: cv.Mat, filename: string, suffix?: string) {
    const parsedPath = path.parse(filename);
    let fullFilename = parsedPath.name;
    if (suffix) {
      fullFilename = fullFilename + "_" + suffix;
    }
    fullFilename += parsedPath.ext;
    const fullPath = path.join(parsedPath.dir, fullFilename);
    cv.imwriteAsync(fullPath, image);
  }

  private static async debugResult(image: cv.Mat, result: MatchResult, filename: string, suffix?: string) {
    const roiRect = new cv.Rect(
      Math.min(Math.max(result.location.left, 0), image.cols),
      Math.min(Math.max(result.location.top, 0), image.rows),
      Math.min(result.location.width, image.cols - result.location.left),
      Math.min(result.location.height, image.rows - result.location.top));
    this.debugImage(image.getRegion(roiRect), filename, suffix);
  }

  constructor(
    private source: DataSource = new ImageReader(),
  ) {
  }

  public async findMatches(matchRequest: MatchRequest, debug: boolean = false): Promise<MatchResult[]> {
    let needle;
    try {
      const needleInput = await this.source.load(matchRequest.pathToNeedle);
      needle = await this.loadNeedle(needleInput);
    } catch (e) {
      throw new Error(
        `Failed to load ${matchRequest.pathToNeedle}. Reason: '${e}'.`,
      );
    }
    if (!needle || needle.empty) {
      throw new Error(
        `Failed to load ${matchRequest.pathToNeedle}, got empty image.`,
      );
    }
    const haystack = await this.loadHaystack(matchRequest);

    if (debug) {
      TemplateMatchingFinder.debugImage(needle, "input_needle.png");
      TemplateMatchingFinder.debugImage(haystack, "input_haystack.png");
    }

    const matchResults = [];
    const unscaledResult = await TemplateMatchingFinder.match(haystack, needle);
    if (debug) {
      TemplateMatchingFinder.debugResult(
        haystack,
        unscaledResult,
        matchRequest.pathToNeedle,
        "unscaled_result");
    }
    if (
      matchRequest.searchMultipleScales &&
      unscaledResult.confidence >= Math.max(matchRequest.confidence - 0.1, 0.6)
    ) {
      const scaledHaystack = await TemplateMatchingFinder.scaleAndMatchHaystack(haystack, needle, debug);
      if (debug) {
        TemplateMatchingFinder.debugResult(
          haystack,
          scaledHaystack,
          matchRequest.pathToNeedle,
          "scaled_haystack_result"
        );
      }
      matchResults.push(scaledHaystack);
      const scaledNeedle = await TemplateMatchingFinder.scaleAndMatchNeedle(haystack, needle, debug);
      if (debug) {
        TemplateMatchingFinder.debugResult(
          haystack,
          scaledNeedle,
          matchRequest.pathToNeedle,
          "scaled_needle_result"
        );
      }
      matchResults.push(scaledNeedle);
    }
    matchResults.push(unscaledResult);

    // Compensate pixel density
    matchResults.forEach(matchResult => {
      matchResult.location.left /= matchRequest.haystack.pixelDensity.scaleX;
      matchResult.location.width /= matchRequest.haystack.pixelDensity.scaleX;
      matchResult.location.top /= matchRequest.haystack.pixelDensity.scaleY;
      matchResult.location.height /= matchRequest.haystack.pixelDensity.scaleY;
    });

    return matchResults.sort(
      (first, second) => second.confidence - first.confidence,
    );
  }

  public async findMatch(matchRequest: MatchRequest, debug: boolean = false): Promise<MatchResult> {
    return new Promise<MatchResult>(async (resolve, reject) => {
      try {
        const matches = await this.findMatches(matchRequest, debug);
        if (matches.length === 0) {
          reject(`Unable to locate ${matchRequest.pathToNeedle}, no match!`);
        }
        resolve(matches[0]);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async loadNeedle(image: Image): Promise<cv.Mat> {
    if (image.hasAlphaChannel) {
      return ImageProcessor.fromImageWithAlphaChannel(image);
    }
    return ImageProcessor.fromImageWithoutAlphaChannel(image);
  }

  private async loadHaystack(matchRequest: MatchRequest): Promise<cv.Mat> {
    const searchRegion = TemplateMatchingFinder.determineScaledSearchRegion(matchRequest);
    if (matchRequest.haystack.hasAlphaChannel) {
      return ImageProcessor.fromImageWithAlphaChannel(
        matchRequest.haystack,
        searchRegion,
      );
    } else {
      return ImageProcessor.fromImageWithoutAlphaChannel(
        matchRequest.haystack,
        searchRegion,
      );
    }
  }
}
