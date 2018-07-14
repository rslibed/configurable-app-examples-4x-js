/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core
import Accessor = require("esri/core/Accessor");
import Handles = require("esri/core/Handles");
import Collection = require("esri/core/Collection");
import watchUtils = require("esri/core/watchUtils");
import requireUtils = require("esri/core/requireUtils");
import promiseUtils = require("esri/core/promiseUtils");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.views
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

//esri.geometry
import Point = require("esri/geometry/Point");

// esri.request
import esriRequest = require("esri/request");

// require
import moduleRequire = require("require");

// Share Item
import ShareItem = require("./ShareItem");

//----------------------------------
//
//  Share Item Collection
//
//----------------------------------
const ShareItemCollection = Collection.ofType<ShareItem>(ShareItem);

//----------------------------------
//
//  Default Share Items
//
//----------------------------------
const FACEBOOK_ITEM = new ShareItem({
  id: "facebook",
  name: "Facebook",
  urlTemplate: "https://www.facebook.com/sharer/sharer.php?s=100&p[url]={url}"
});
const TWITTER_ITEM = new ShareItem({
  id: "twitter",
  name: "Twitter",
  urlTemplate: "https://twitter.com/intent/tweet?url={url}"
});
const GOOGLE_ITEM = new ShareItem({
  id: "googleplus",
  name: "Google",
  urlTemplate: "https://plus.google.com/share?url={url}"
});
const EMAIL_ITEM = new ShareItem({
  id: "email",
  name: "E-mail",
  urlTemplate: "mailto:?subject={title}&body={summary}%20{url}"
});

//----------------------------------
//
//  Shorten URL API
//
//----------------------------------
const SHORTEN_API = "https://arcg.is/prod/shorten";

//----------------------------------
//
//  State
//
//----------------------------------
type State = "ready" | "loading" | "disabled";

//----------------------------------
//
//  Shortened State
//
//----------------------------------
type ShortenState = "ready" | "loading" | "shortening";

@subclass("ShareViewModel")
class ShareViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------
  initialize() {
    this._handles.add([
      // Generate URL once view is ready
      watchUtils.whenTrue(this, "view.ready", () => {
        if (this.shortenLinkEnabled) {
          this._generateShareUrl().then(generatedUrl => {
            this.shorten(generatedUrl).then(shortenedUrl =>
              this._set("shareUrl", shortenedUrl)
            );
          });
        } else {
          this._generateShareUrl().then(generatedUrl => {
            this._set("shareUrl", generatedUrl);
          });
        }
      }),
      watchUtils.init(this, "shareLocationEnabled", () => {
        const shareLocationKey = "shareLocation";
        // If share location checkbox is toggled, watch for view.interaction
        if (this.shareLocationEnabled) {
          this._handles.add(
            watchUtils.init(this, "view.interacting", () => {
              this._setUIandURL();
            }),
            shareLocationKey
          );
          // Otherwise, stop watching view.interaction
        } else {
          this._handles.remove(shareLocationKey);
          this._setUIandURL();
        }
      })
    ]);
  }

  destroy() {
    this.shareItems.removeAll();
    this._handles.removeAll();
    this._handles = null;
    this.view = null;
  }

  //----------------------------------
  //
  //  State
  //
  //----------------------------------
  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    const view = this.get("view");
    const ready = this.get("view.ready");
    return ready ? "ready" : view ? "loading" : "disabled";
  }

  //----------------------------------
  //
  //  ShortenState
  //
  //----------------------------------
  @property({
    dependsOn: ["shortening"],
    readOnly: true
  })
  get shortenState(): ShortenState {
    const view = this.get("view");
    const ready = this.get("shortening");
    return !ready ? "ready" : view ? "shortening" : "loading";
  }

  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  // Handles
  private _handles: Handles = new Handles();

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  //----------------------------------
  //
  //  shortening - readOnly
  //
  //----------------------------------
  @property({ readOnly: true })
  shortening: boolean = null;

  //----------------------------------
  //
  // linkGenerated - readOnly (determines UI state)
  //
  //----------------------------------
  @property({ readOnly: true })
  linkGenerated = false;

  //----------------------------------
  //
  //  shareUrl - readOnly
  //
  //----------------------------------
  @property({ readOnly: true })
  shareUrl: string = null;

  //----------------------------------
  //
  //  view
  //
  //----------------------------------
  @property() view: MapView | SceneView = null;

  //----------------------------------
  //
  //  shareLocationEnabled
  //
  //----------------------------------
  @property() shareLocationEnabled = true;

  //----------------------------------
  //
  // shortenLinkEnabled
  //
  //----------------------------------
  @property() shortenLinkEnabled = true;

  //----------------------------------
  //
  //  geometryServiceUrl
  //
  //----------------------------------
  @property()
  geometryServiceUrl =
    "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/project";

  //----------------------------------
  //
  //  shareItems
  //
  //----------------------------------
  @property({
    type: ShareItemCollection
  })
  shareItems: Collection<ShareItem> = new ShareItemCollection([
    FACEBOOK_ITEM,
    TWITTER_ITEM,
    GOOGLE_ITEM,
    EMAIL_ITEM
  ]);

  //----------------------------------
  //
  //  Public Method
  //
  //----------------------------------
  shorten(url?): IPromise<string> {
    this._set("shortening", true);
    return esriRequest(SHORTEN_API, {
      callbackParamName: "callback",
      query: {
        longUrl: url ? url : this.shareUrl,
        f: "json"
      }
    })
      .catch(res => {
        this._set("shortening", false);
        return res;
      })
      .then(res => {
        const shortUrl = res.data && res.data.data && res.data.data.url;
        this._set("shortening", false);
        if (shortUrl) {
          this._set("linkGenerated", true);
          this._set("shareUrl", shortUrl);
          return shortUrl;
        }
      });
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------
  private _setUIandURL(): void {
    // If shortenLinkEnabled is true, set linkGenerated to false to reset UI to "Generate Link" state
    if (this.shortenLinkEnabled) {
      this._set("linkGenerated", false);
    }
    this._generateShareUrl().then(url => {
      this._set("shareUrl", url);
    });
  }

  private _generateShareUrl(): IPromise<string> {
    const { href } = window.location;
    // If view is not ready or share location is disabled return href
    if (!this.get("view.ready") || !this.shareLocationEnabled) {
      // Check if href has "center"
      if (href.indexOf("center") !== -1) {
        // Grab substring before "center" to clear previous values. If substring has extra "&", remove it
        const path =
          href.split("center")[0].indexOf("&") !== -1
            ? href.split("center")[0].slice(0, -1)
            : href.split("center")[0];
        return promiseUtils.resolve(path);
      }
      return promiseUtils.resolve(href);
    }
    // Use x/y values and the spatial reference of the view to instantiate a geometry point
    const { x, y } = this.view.center;
    const { spatialReference } = this.view;
    const pointToConvert = new Point({
      x,
      y,
      spatialReference
    });
    // Use pointToConvert to project point. Once projected, pass point to generate the share URL parameters
    return this._projectPoint(pointToConvert).then((convertedPoint: Point) => {
      return this._generateShareUrlParams(convertedPoint);
    });
  }

  // Method to project non-WGS84/non-Web Mercator spatial reference point
  private _projectPoint(point: Point): IPromise<Point> {
    const { isWGS84, isWebMercator } = point.spatialReference;
    // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
    if (isWGS84 || isWebMercator) {
      return promiseUtils.resolve(point);
    }
    return requireUtils
      .when(moduleRequire, [
        "esri/tasks/GeometryService",
        "esri/tasks/support/ProjectParameters",
        "esri/geometry/SpatialReference"
      ])
      .then(([GeometryService, ProjectParameters, SpatialReference]) => {
        // Allows user to use default geometry service or set the service by providing a geometry service url
        const geometryService = new GeometryService({
          url: this.geometryServiceUrl
        });
        // Create projection parameters instance to pass to geometry service
        const params = new ProjectParameters({
          geometries: [point],
          outSpatialReference: SpatialReference.WGS84
        });
        // Project point
        return geometryService
          .project(params)
          .catch(function(err: any) {
            console.error("ERROR: ", err);
          })
          .then((projectedPoint: any) => {
            return projectedPoint[0] as Point;
          });
      });
  }

  private _generateShareUrlParams(point: Point): string {
    const { href } = window.location;
    const { longitude, latitude } = point;
    const roundedLon = this._roundValue(longitude);
    const roundedLat = this._roundValue(latitude);
    const { zoom } = this.view;
    const roundedZoom = this._roundValue(zoom);
    // Handles pre existing href. Check if href has "&center"
    if (href.indexOf("&center") !== -1) {
      const path = href.split("&center")[0];
      return `${path}&center=${roundedLon},${roundedLat}&level=${roundedZoom}`;
    }
    const path = href.split("center")[0];
    // If no "?", then append "?". Otherwise, check for "?" and "="
    const sep =
      path.indexOf("?") === -1
        ? "?"
        : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
          ? "&"
          : "";
    const shareParams = `${path}${sep}center=${roundedLon},${roundedLat}&level=${roundedZoom}`;
    const { camera, type } = this.view;
    // Checks if view.type is 3D, if so add, 3D url parameters
    if (type === "3d") {
      const { heading, fov, tilt } = camera;
      const roundedHeading = this._roundValue(heading);
      const roundedFov = this._roundValue(fov);
      const roundedTilt = this._roundValue(tilt);
      return `${shareParams}&heading=${roundedHeading}&fov=${roundedFov}&tilt=${roundedTilt}`;
    }
    // Otherwise, just return original url parameters for 2D
    return shareParams;
  }

  private _roundValue(val: number): number {
    return parseFloat(val.toFixed(4));
  }
}

export = ShareViewModel;
