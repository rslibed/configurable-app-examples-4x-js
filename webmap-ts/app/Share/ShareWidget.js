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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./Share/nls/resources", "esri/core/lang", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./Share/ShareViewModel"], function (require, exports, __extends, __decorate, i18n, lang_1, decorators_1, Widget, widget_1, ShareViewModel) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-share",
        header: {
            container: "esri-share__header-container",
            heading: "esri-share__heading"
        },
        main: {
            mainContainer: "esri-share__main-container",
            mainHeader: "esri-share__main-header",
            mainHR: "esri-share__hr",
            mainLocation: {
                shareLocationContainer: "esri-share__share-location-container",
                shareLocation: "esri-share__share-location"
            },
            mainCopy: {
                copyContainer: "esri-share__copy-container",
                copyClipboard: "esri-share__copy-clipboard"
            },
            mainShorten: {
                shortenUrl: "esri-share__shorten-url",
                loading: "esri-share--loading"
            },
            mainUrl: {
                inputGroup: "esri-share__copy-url-group",
                urlInput: "esri-share__url-input"
            },
            mainShare: {
                shareContainer: "esri-share__share-container",
                shareItem: "esri-share__share-item",
                shareIcons: {
                    facebook: "icon-social-facebook",
                    twitter: "icon-social-twitter",
                    googleplus: "icon-social-google-plus",
                    email: "icon-social-contact",
                    instagram: "icon-social-instagram",
                    linkedin: "icon-social-linkedin",
                    pinterest: "icon-social-pinterest",
                    geonet: "icon-social-geonet",
                    github: "icon-social-github",
                    rss: "icon-social-rss"
                }
            },
            mainInputLabel: "esri-share__input-label"
        },
        icons: {
            widgetIcon: "icon-ui-share",
            svgIcon: "svg-icon",
            shortenIcon: "esri-share__shorten-icon",
            loadingIcon: "esri-share--loading-icon",
            esriRotatingIcon: "esri-share--esri-rotating",
            copyIcon: "esri-share__copy-icon"
        }
    };
    var Share = /** @class */ (function (_super) {
        __extends(Share, _super);
        function Share() {
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._urlNode = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            //----------------------------------
            //
            //  loading - readOnly
            //
            //----------------------------------
            _this.loading = null;
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
            //  geometryServiceUrl - readOnly
            //
            //----------------------------------
            _this.geometryServiceurl = null;
            //----------------------------------
            //
            //  linkGenerated - readOnly
            //
            //----------------------------------
            _this.linkGenerated = null;
            //----------------------------------
            //
            //  view
            //
            //----------------------------------
            _this.view = null;
            //----------------------------------
            //
            //  shareItems
            //
            //----------------------------------
            _this.shareItems = null;
            //----------------------------------
            //
            //  shareLocationEnabled
            //
            //----------------------------------
            _this.shareLocationEnabled = null;
            //----------------------------------
            //
            //  shortenLinkEnabled
            //
            //----------------------------------
            _this.shortenLinkEnabled = null;
            //----------------------------------
            //
            //  iconClass
            //
            //----------------------------------
            _this.iconClass = CSS.icons.widgetIcon;
            //----------------------------------
            //
            //  label
            //
            //----------------------------------
            _this.label = i18n.widgetLabel;
            //----------------------------------
            //
            //  viewModel
            //
            //----------------------------------
            _this.viewModel = new ShareViewModel();
            return _this;
        }
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        Share.prototype.render = function () {
            var _a = this.viewModel, state = _a.state, shareLocationEnabled = _a.shareLocationEnabled;
            var shareItemNodes = this._renderShareItems();
            var shareItemNode = state === "ready" && shareItemNodes.length ? [shareItemNodes] : null;
            var inputSubheader = this.linkGenerated
                ? i18n.clipboard
                : i18n.generateLink;
            var generateLinkNode = (widget_1.tsx("button", { bind: this, onclick: this._shortenShareUrl, onkeydown: this._shortenShareUrl, tabIndex: 0, class: CSS.main.mainShorten.shortenUrl }, i18n.generateLink));
            var loadingIconNode = this.shortenLinkEnabled ? (this.loading ? (widget_1.tsx("div", { class: CSS.main.mainShorten.loading },
                widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 32 32", class: this.classes(CSS.icons.svgIcon, CSS.icons.esriRotatingIcon, CSS.icons.loadingIcon) },
                    widget_1.tsx("path", { d: "M27.518 8.338c.324.37.772.94 1.261 1.727a13.499 13.499 0 0 1 1.986 7.41c-.019 3.243-1.41 7.185-4.559 10.081-3.085 2.902-7.94 4.492-12.611 3.566-4.697-.832-8.864-4.161-10.853-8.38-2.043-4.23-1.863-9.035-.373-12.647 1.463-3.672 4.051-6.09 6.098-7.421C10.551 1.336 12.092.889 12.389.802c1.234-.356 2.457-.18 3.282.309.839.511 1.281 1.259 1.276 2.105-.079 1.717-1.406 3.039-2.86 3.478-.19.051-1.158.258-2.564.99a10.6 10.6 0 0 0-4.43 4.522c-1.216 2.318-1.698 5.672-.504 8.872 1.158 3.185 4.042 6.059 7.693 7.058 3.629 1.078 7.773.199 10.671-2.06 2.944-2.244 4.563-5.648 4.855-8.66.369-3.046-.465-5.615-1.261-7.222a13.163 13.163 0 0 0-1.084-1.812l-.45-.601.504.559z" })))) : null) : null;
            var copyShortenNode = this.linkGenerated ? (widget_1.tsx("input", { class: CSS.main.mainUrl.urlInput, bind: this, onclick: this._copyUrl, onkeydown: this._copyUrl, type: "text", value: this.shortenedUrl ? this.shortenedUrl : this.shareUrl, afterCreate: widget_1.storeNode, "data-node-ref": "_urlNode", readOnly: true })) : (generateLinkNode);
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("div", { class: CSS.header.container },
                    widget_1.tsx("h1", { class: CSS.header.heading }, i18n.heading),
                    loadingIconNode),
                widget_1.tsx("div", { class: CSS.main.mainContainer },
                    widget_1.tsx("div", { class: CSS.main.mainLocation.shareLocationContainer },
                        widget_1.tsx("label", { class: CSS.main.mainInputLabel },
                            widget_1.tsx("input", { class: CSS.main.mainLocation.shareLocation, checked: shareLocationEnabled, type: "checkbox", onclick: this._toggleShareLocation, bind: this }),
                            i18n.shareLocation)),
                    widget_1.tsx("div", { class: CSS.main.mainCopy.copyContainer },
                        widget_1.tsx("h2", { class: CSS.main.mainHeader }, this.shortenLinkEnabled ? inputSubheader : i18n.clipboard),
                        widget_1.tsx("div", { class: CSS.main.mainUrl.inputGroup }, this.shortenLinkEnabled ? (copyShortenNode) : (widget_1.tsx("input", { class: CSS.main.mainUrl.urlInput, type: "text", value: this.shareUrl, afterCreate: widget_1.storeNode, bind: this, onclick: this._copyUrl, onkeydown: this._copyUrl, "data-node-ref": "_urlNode", readOnly: true })))),
                    widget_1.tsx("hr", { class: CSS.main.mainHR }),
                    widget_1.tsx("div", { class: CSS.main.mainShare.shareContainer },
                        widget_1.tsx("h2", { class: CSS.main.mainHeader }, i18n.subHeading),
                        shareItemNode))));
        };
        Share.prototype._toggleShareLocation = function () {
            this.viewModel.shareLocationEnabled = !this.viewModel.shareLocationEnabled;
        };
        Share.prototype._copyUrl = function () {
            this._urlNode.select();
            document.execCommand("copy");
        };
        Share.prototype._processShareItem = function (event) {
            var _this = this;
            var node = event.currentTarget;
            var shareItem = node["data-share-item"];
            var urlTemplate = shareItem.urlTemplate;
            var portalItem = this.get("view.map.portalItem");
            var title = portalItem
                ? lang_1.substitute({ title: portalItem.title }, i18n.urlTitle)
                : null;
            var summary = portalItem
                ? lang_1.substitute({ summary: portalItem.snippet }, i18n.urlSummary)
                : null;
            if (this.shortenLinkEnabled) {
                this._shortenShareUrl().then(function (res) {
                    _this._openUrl(res, title, summary, urlTemplate);
                });
                return;
            }
            this._openUrl(this.shareUrl, title, summary, urlTemplate);
        };
        Share.prototype._shortenShareUrl = function () {
            return this.viewModel.shorten().then(function (shortenedUrl) {
                return shortenedUrl;
            });
        };
        Share.prototype._openUrl = function (url, title, summary, urlTemplate) {
            var urlToOpen = lang_1.substitute({
                url: encodeURI(url),
                title: title,
                summary: summary
            }, urlTemplate);
            window.open(urlToOpen);
        };
        Share.prototype._renderShareItem = function (shareItem) {
            var name = shareItem.name, className = shareItem.className;
            return (widget_1.tsx("a", { bind: this, "data-share-item": shareItem, class: this.classes(CSS.main.mainShare.shareItem, name), title: name, onclick: this._processShareItem, onkeydown: this._processShareItem, role: "button", tabIndex: 0, "aria-label": name },
                widget_1.tsx("span", { class: className })));
        };
        Share.prototype._renderShareItems = function () {
            var _this = this;
            var shareItems = this.shareItems;
            var shareIcons = CSS.main.mainShare.shareIcons;
            // Assign class names of icons to share item
            shareItems.items.forEach(function (shareItem) {
                for (var key in shareIcons) {
                    if (key === shareItem.id) {
                        shareItem.className = shareIcons[shareItem.id];
                    }
                }
            });
            return shareItems
                .toArray()
                .map(function (shareItems) { return _this._renderShareItem(shareItems); });
        };
        __decorate([
            decorators_1.aliasOf("viewModel.loading"),
            widget_1.renderable()
        ], Share.prototype, "loading", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareUrl"),
            widget_1.renderable()
        ], Share.prototype, "shareUrl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shortenedUrl"),
            widget_1.renderable()
        ], Share.prototype, "shortenedUrl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.geometryServiceUrl"),
            widget_1.renderable()
        ], Share.prototype, "geometryServiceurl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.linkGenerated"),
            widget_1.renderable()
        ], Share.prototype, "linkGenerated", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], Share.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareItems"),
            widget_1.renderable()
        ], Share.prototype, "shareItems", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shareLocationEnabled"),
            widget_1.renderable()
        ], Share.prototype, "shareLocationEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.shortenLinkEnabled"),
            widget_1.renderable()
        ], Share.prototype, "shortenLinkEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], Share.prototype, "iconClass", void 0);
        __decorate([
            decorators_1.property()
        ], Share.prototype, "label", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state"]),
            decorators_1.property({
                type: ShareViewModel
            })
        ], Share.prototype, "viewModel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_toggleShareLocation", null);
        __decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_copyUrl", null);
        __decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_processShareItem", null);
        Share = __decorate([
            decorators_1.subclass("Share")
        ], Share);
        return Share;
    }(decorators_1.declared(Widget)));
    return Share;
});
//# sourceMappingURL=ShareWidget.js.map