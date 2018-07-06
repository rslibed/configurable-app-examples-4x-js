/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import i18n = require("dojo/i18n!./nls/resources");

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

@subclass("ShareViewModel")
class ShareViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  initialize() {
    this._handles.add([
      watchUtils.whenTrue(this, "view.ready", () => {
        if (this.shortenLinkEnabled) {
          this._generateShareUrl().then(generatedUrl => {
            this.shorten(generatedUrl).then(shortenedUrl =>
              this._set("shareUrl", shortenedUrl)
            );
          });
        } else {
          this._generateShareUrl().then(res => {
            this._set("shareUrl", res);
          });
        }
      }),
      watchUtils.init(this, "shareLocationEnabled", () => {
        const shareLocationKey = "shareLocation";
        if (this.shareLocationEnabled) {
          this._handles.add(
            watchUtils.init(this, "view.interacting", () => {
              // Once user interacts with map and if shroten link is enabled, reset widget back to default "generate link" state
              if (this.shortenLinkEnabled) {
                this._set("linkGenerated", false);
                // this._set("shortenedUrl", i18n.clickToGenerate);
              }
              this._setUrl();
            }),
            shareLocationKey
          );
          // Otherwise, watch  utils is removed from handles to stop watching viewpoint
        } else {
          this._handles.remove(shareLocationKey);
          this._setUrl();
        }
        if (this.shortenLinkEnabled) {
          this._set("linkGenerated", false);
          // this._set("shortenedUrl", i18n.clickToGenerate);
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
  //  shareUrl - readOnly
  //
  //----------------------------------

  @property({ readOnly: true })
  shareUrl: string = null;

  //----------------------------------
  //
  //  shortenedUrl - readOnly
  //
  //----------------------------------

  @property({ readOnly: true })
  shortenedUrl: string = null;

  //----------------------------------
  //
  // linkGenerated - readOnly
  //
  //----------------------------------

  @property({ readOnly: true })
  linkGenerated: boolean = null;

  //----------------------------------
  //
  //  loading - readOnly
  //
  //----------------------------------
  @property({ readOnly: true })
  loading = false;

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
  //  Public Methods
  //
  //----------------------------------

  shorten(url?: string): IPromise<string> {
    this._set("loading", true);
    // Uses share Url and making a request to URL shorten API and set new values to properties
    return esriRequest(SHORTEN_API, {
      callbackParamName: "callback",
      query: {
        longUrl: url ? url : this.shareUrl,
        f: "json"
      }
    })
      .catch(res => {
        this._set("loading", false);
        return res;
      })
      .then(res => {
        const shortUrl = res.data && res.data.data && res.data.data.url;
        this._set("loading", false);
        if (shortUrl) {
          this._set("linkGenerated", true);
          this._set("shortenedUrl", shortUrl);
          return shortUrl;
        }
      });
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------

  private _setUrl(): void {
    this._generateShareUrl().then(url => {
      this._set("shareUrl", url);
    });
  }

  private _generateShareUrl(): IPromise<string> {
    const { href } = window.location;
    // If view is not ready or share location is disabled return href
    if (!this.get("view.ready") || !this.shareLocationEnabled) {
      // Check if href has center
      if (href.indexOf("center") !== -1) {
        // Grab substring before "center" to clear previous values. If substring has extra "&", remove it. Otherwise, give original href
        const path =
          href.split("center")[0].indexOf("&") !== -1
            ? href.split("center")[0].slice(0, -1)
            : href.split("center")[0];
        return promiseUtils.resolve(path);
      }
      // Otherwise return href
      return promiseUtils.resolve(href);
    }
    const { spatialReference } = this.view;
    // If SR is WGS84 or Web Mercator, use longitude/latitude values to create url sttring
    if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
      const { longitude, latitude } = this.view.center;
      const point = new Point({
        longitude,
        latitude
      });
      return promiseUtils.resolve(this._createUrlString(point));
    }
    // Otherwise, use x and y values to create point and call _projectPoint method to convert values
    const { x, y } = this.view.center;
    const pointToConvert = new Point({ x, y, spatialReference });
    return this._projectPoint(pointToConvert).then((convertedPoint: Point) => {
      return this._createUrlString(convertedPoint);
    });
  }

  private _createUrlString(point: Point): string {
    // User longitude and latitude values to create params for center
    const { href } = window.location;
    const { longitude, latitude } = point;
    const roundedLon = this._roundValue(longitude);
    const roundedLat = this._roundValue(latitude);
    const { zoom } = this.view;
    const roundedZoom = this._roundValue(zoom);
    // Check if href has "&center"
    if (href.indexOf("&center") !== -1) {
      const path = href.split("&center")[0];
      const sep = path.indexOf("?") === -1 ? "?" : "&";
      const shareValues = `${path}${sep}center=${roundedLon},${roundedLat}&level=${roundedZoom}`;
      return this._determineViewTypeParams(shareValues);
    }
    const path = href.split("center")[0];
    // If no "?", then append "?". Otherwise, check for "?" and "="
    const sep =
      path.indexOf("?") === -1
        ? "?"
        : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
          ? "&"
          : "";
    const shareValues = `${path}${sep}center=${roundedLon},${roundedLat}&level=${roundedZoom}`;
    return this._determineViewTypeParams(shareValues);
  }

  private _projectPoint(point: Point): IPromise<Point> {
    return requireUtils
      .when(moduleRequire, [
        "esri/tasks/GeometryService",
        "esri/tasks/support/ProjectParameters",
        "esri/geometry/SpatialReference"
      ])
      .then(([GeometryService, ProjectParameters, SpatialReference]) => {
        // Can either use default geometry service url or sevice url provided by user
        const geometryService = new GeometryService({
          url: this.geometryServiceUrl
        });
        // Create projection parameters to use in geo service
        const params = new ProjectParameters({
          geometries: [point],
          outSpatialReference: SpatialReference.WGS84
        });
        // Project points
        return geometryService
          .project(params)
          .catch(function(err: any) {
            console.error("ERROR: ", err);
          })
          .then((projectedPoints: any) => {
            return projectedPoints[0] as Point;
          });
      });
  }

  private _determineViewTypeParams(shareValues: string): string {
    const { camera, type } = this.view;
    // Checks if view.type is 3D, if so add, 3D url params
    if (type === "3d") {
      const { heading, fov, tilt } = camera;
      const roundedHeading = this._roundValue(heading);
      const roundedFov = this._roundValue(fov);
      const roundedTilt = this._roundValue(tilt);
      return `${shareValues}&heading=${roundedHeading}&fov=${roundedFov}&tilt=${roundedTilt}`;
    }
    // Otherwise, just return original shareValues for 2D
    return shareValues;
  }

  private _roundValue(val: number): number {
    return parseFloat(val.toFixed(4));
  }
}

export = ShareViewModel;
