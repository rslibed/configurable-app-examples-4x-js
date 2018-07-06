/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./nls/resources", "esri/core/Accessor", "esri/core/Handles", "esri/core/Collection", "esri/core/watchUtils", "esri/core/requireUtils", "esri/core/promiseUtils", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/request", "require", "./ShareItem"], function (require, exports, __extends, __decorate, i18n, Accessor, Handles, Collection, watchUtils, requireUtils, promiseUtils, decorators_1, Point, esriRequest, moduleRequire, ShareItem) {
    "use strict";
    //----------------------------------
    //
    //  Share Item Collection
    //
    //----------------------------------
    var ShareItemCollection = Collection.ofType(ShareItem);
    //----------------------------------
    //
    //  Default Share Items
    //
    //----------------------------------
    var FACEBOOK_ITEM = new ShareItem({
        id: "facebook",
        name: "Facebook",
        urlTemplate: "https://www.facebook.com/sharer/sharer.php?s=100&p[url]={url}"
    });
    var TWITTER_ITEM = new ShareItem({
        id: "twitter",
        name: "Twitter",
        urlTemplate: "https://twitter.com/intent/tweet?url={url}"
    });
    var GOOGLE_ITEM = new ShareItem({
        id: "googleplus",
        name: "Google",
        urlTemplate: "https://plus.google.com/share?url={url}"
    });
    var EMAIL_ITEM = new ShareItem({
        id: "email",
        name: "E-mail",
        urlTemplate: "mailto:?subject={title}&body={summary}%20{url}"
    });
    //----------------------------------
    //
    //  Shorten URL API
    //
    //----------------------------------
    var SHORTEN_API = "https://arcg.is/prod/shorten";
    var ShareViewModel = /** @class */ (function (_super) {
        __extends(ShareViewModel, _super);
        function ShareViewModel() {
            //----------------------------------
            //
            //  Lifecycle
            //
            //----------------------------------
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            // Handles
            _this._handles = new Handles();
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
            _this.shareUrl = null;
            //----------------------------------
            //
            //  shortenedUrl - readOnly
            //
            //----------------------------------
            _this.shortenedUrl = null;
            //----------------------------------
            //
            // linkGenerated - readOnly
            //
            //----------------------------------
            _this.linkGenerated = null;
            //----------------------------------
            //
            //  loading - readOnly
            //
            //----------------------------------
            _this.loading = false;
            //----------------------------------
            //
            //  view
            //
            //----------------------------------
            _this.view = null;
            //----------------------------------
            //
            //  shareLocationEnabled
            //
            //----------------------------------
            _this.shareLocationEnabled = true;
            //----------------------------------
            //
            // shortenLinkEnabled
            //
            //----------------------------------
            _this.shortenLinkEnabled = true;
            //----------------------------------
            //
            //  geometryServiceUrl
            //
            //----------------------------------
            _this.geometryServiceUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/project";
            //----------------------------------
            //
            //  shareItems
            //
            //----------------------------------
            _this.shareItems = new ShareItemCollection([
                FACEBOOK_ITEM,
                TWITTER_ITEM,
                GOOGLE_ITEM,
                EMAIL_ITEM
            ]);
            return _this;
        }
        ShareViewModel.prototype.initialize = function () {
            var _this = this;
            this._handles.add([
                watchUtils.whenTrue(this, "view.ready", function () {
                    if (_this.shortenLinkEnabled) {
                        _this._generateShareUrl().then(function (generatedUrl) {
                            _this.shorten(generatedUrl).then(function (shortenedUrl) {
                                return _this._set("shareUrl", res);
                            });
                        });
                    }
                    else {
                        _this._generateShareUrl().then(function (res) {
                            _this._set("shareUrl", res);
                        });
                    }
                }),
                watchUtils.init(this, "shareLocationEnabled", function () {
                    var shareLocationKey = "shareLocation";
                    if (_this.shareLocationEnabled) {
                        _this._handles.add(watchUtils.init(_this, "view.interacting", function () {
                            if (_this.shortenLinkEnabled) {
                                _this._set("linkGenerated", false);
                                _this._set("shortenedUrl", i18n.clickToGenerate);
                            }
                            _this._setUrl();
                        }), shareLocationKey);
                        // Otherwise, watch  utils is removed from handles to stop watching viewpoint
                    }
                    else {
                        _this._handles.remove(shareLocationKey);
                        _this._setUrl();
                    }
                    if (_this.shortenLinkEnabled) {
                        _this._set("linkGenerated", false);
                        _this._set("shortenedUrl", i18n.clickToGenerate);
                    }
                })
            ]);
        };
        ShareViewModel.prototype.destroy = function () {
            this.shareItems.removeAll();
            this._handles.removeAll();
            this._handles = null;
            this.view = null;
        };
        Object.defineProperty(ShareViewModel.prototype, "state", {
            //----------------------------------
            //
            //  State
            //
            //----------------------------------
            get: function () {
                var view = this.get("view");
                var ready = this.get("view.ready");
                return ready ? "ready" : view ? "loading" : "disabled";
            },
            enumerable: true,
            configurable: true
        });
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        ShareViewModel.prototype.shorten = function (url) {
            var _this = this;
            this._set("loading", true);
            // Uses share Url and making a request to URL shorten API and set new values to properties
            return esriRequest(SHORTEN_API, {
                callbackParamName: "callback",
                query: {
                    longUrl: url ? url : this.shareUrl,
                    f: "json"
                }
            })
                .catch(function (res) {
                _this._set("loading", false);
                return res;
            })
                .then(function (res) {
                var shortUrl = res.data && res.data.data && res.data.data.url;
                _this._set("loading", false);
                if (shortUrl) {
                    _this._set("linkGenerated", true);
                    _this._set("shortenedUrl", shortUrl);
                    return shortUrl;
                }
            });
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        ShareViewModel.prototype._setUrl = function () {
            var _this = this;
            this._generateShareUrl().then(function (url) {
                _this._set("shareUrl", url);
            });
        };
        ShareViewModel.prototype._generateShareUrl = function () {
            var _this = this;
            var href = window.location.href;
            // If view is not ready or share location is disabled return href
            if (!this.get("view.ready") || !this.shareLocationEnabled) {
                // Check if href has center
                if (href.indexOf("center") !== -1) {
                    // Grab substring before "center" to clear previous values. If substring has extra "&", remove it. Otherwise, give original href
                    var path = href.split("center")[0].indexOf("&") !== -1
                        ? href.split("center")[0].slice(0, -1)
                        : href.split("center")[0];
                    return promiseUtils.resolve(path);
                }
                // Otherwise return href
                return promiseUtils.resolve(href);
            }
            var spatialReference = this.view.spatialReference;
            // If SR is WGS84 or Web Mercator, use longitude/latitude values to create url sttring
            if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
                var _a = this.view.center, longitude = _a.longitude, latitude = _a.latitude;
                var point = new Point({
                    longitude: longitude,
                    latitude: latitude
                });
                return promiseUtils.resolve(this._createUrlString(point));
            }
            // Otherwise, use x and y values to create point and call _projectPoint method to convert values
            var _b = this.view.center, x = _b.x, y = _b.y;
            var pointToConvert = new Point({ x: x, y: y, spatialReference: spatialReference });
            return this._projectPoint(pointToConvert).then(function (convertedPoint) {
                return _this._createUrlString(convertedPoint);
            });
        };
        ShareViewModel.prototype._createUrlString = function (point) {
            // User longitude and latitude values to create params for center
            var href = window.location.href;
            var longitude = point.longitude, latitude = point.latitude;
            var roundedLon = this._roundValue(longitude);
            var roundedLat = this._roundValue(latitude);
            var zoom = this.view.zoom;
            var roundedZoom = this._roundValue(zoom);
            // Check if href has "&center"
            if (href.indexOf("&center") !== -1) {
                var url_1 = href.split("&center")[0];
                var sep_1 = url_1.indexOf("?") === -1 ? "?" : "&";
                var shareValues_1 = "" + url_1 + sep_1 + "center=" + roundedLon + "," + roundedLat + "&level=" + roundedZoom;
                return this._determineViewTypeParams(shareValues_1);
            }
            var url = href.split("center")[0];
            // If no "?", then append "?". Otherwise, check for "?" and "="
            var sep = url.indexOf("?") === -1
                ? "?"
                : url.indexOf("?") !== -1 && url.indexOf("=") !== -1
                    ? "&"
                    : "";
            var shareValues = "" + url + sep + "center=" + roundedLon + "," + roundedLat + "&level=" + roundedZoom;
            return this._determineViewTypeParams(shareValues);
        };
        ShareViewModel.prototype._projectPoint = function (point) {
            var _this = this;
            return requireUtils
                .when(moduleRequire, [
                "esri/tasks/GeometryService",
                "esri/tasks/support/ProjectParameters",
                "esri/geometry/SpatialReference"
            ])
                .then(function (_a) {
                var GeometryService = _a[0], ProjectParameters = _a[1], SpatialReference = _a[2];
                // Can either use default geometry service url or sevice url provided by user
                var geometryService = new GeometryService({
                    url: _this.geometryServiceUrl
                });
                // Create projection parameters to use in geo service
                var params = new ProjectParameters({
                    geometries: [point],
                    outSpatialReference: SpatialReference.WGS84
                });
                // Project points
                return geometryService
                    .project(params)
                    .catch(function (err) {
                    console.error("ERROR: ", err);
                })
                    .then(function (projectedPoints) {
                    return projectedPoints[0];
                });
            });
        };
        ShareViewModel.prototype._determineViewTypeParams = function (shareValues) {
            var _a = this.view, camera = _a.camera, type = _a.type;
            // Checks if view.type is 3D, if so add, 3D url params
            if (type === "3d") {
                var heading = camera.heading, fov = camera.fov, tilt = camera.tilt;
                var roundedHeading = this._roundValue(heading);
                var roundedFov = this._roundValue(fov);
                var roundedTilt = this._roundValue(tilt);
                return shareValues + "&heading=" + roundedHeading + "&fov=" + roundedFov + "&tilt=" + roundedTilt;
            }
            // Otherwise, just return original shareValues for 2D
            return shareValues;
        };
        ShareViewModel.prototype._roundValue = function (val) {
            return parseFloat(val.toFixed(4));
        };
        __decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], ShareViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], ShareViewModel.prototype, "shareUrl", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], ShareViewModel.prototype, "shortenedUrl", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], ShareViewModel.prototype, "linkGenerated", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], ShareViewModel.prototype, "loading", void 0);
        __decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "shareLocationEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "shortenLinkEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], ShareViewModel.prototype, "geometryServiceUrl", void 0);
        __decorate([
            decorators_1.property({
                type: ShareItemCollection
            })
        ], ShareViewModel.prototype, "shareItems", void 0);
        ShareViewModel = __decorate([
            decorators_1.subclass("ShareViewModel")
        ], ShareViewModel);
        return ShareViewModel;
    }(decorators_1.declared(Accessor)));
    return ShareViewModel;
});
//# sourceMappingURL=ShareViewModel.js.map