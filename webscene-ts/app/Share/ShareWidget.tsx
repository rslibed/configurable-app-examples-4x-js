/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import i18n = require("dojo/i18n!./Share/nls/resources");

// esri.core
import Collection = require("esri/core/Collection");
import { substitute } from "esri/core/lang";

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

// esri.views
import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");

// esri.widgets
import Widget = require("esri/widgets/Widget");

//esri.widgets.support
import {
  accessibleHandler,
  renderable,
  tsx,
  storeNode
} from "esri/widgets/support/widget";

import ShareViewModel = require("./Share/ShareViewModel");
import ShareItem = require("./Share/ShareItem");

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
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

@subclass("Share")
class Share extends declared(Widget) {
  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------

  private _urlNode: HTMLInputElement = null;

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

  @aliasOf("viewModel.loading")
  @renderable()
  loading: boolean = null;

  //----------------------------------
  //
  //  shareUrl - readOnly
  //
  //----------------------------------
  @aliasOf("viewModel.shareUrl")
  @renderable()
  shareUrl: string = null;

  //----------------------------------
  //
  //  shortenedUrl - readOnly
  //
  //----------------------------------
  @aliasOf("viewModel.shortenedUrl")
  @renderable()
  shortenedUrl: string = null;

  //----------------------------------
  //
  //  geometryServiceUrl - readOnly
  //
  //----------------------------------

  @aliasOf("viewModel.geometryServiceUrl")
  @renderable()
  geometryServiceurl: string = null;

  //----------------------------------
  //
  //  linkGenerated - readOnly
  //
  //----------------------------------
  @aliasOf("viewModel.linkGenerated")
  @renderable()
  linkGenerated: boolean = null;

  //----------------------------------
  //
  //  View
  //
  //----------------------------------

  @aliasOf("viewModel.view") view: MapView | SceneView = null;

  //----------------------------------
  //
  //  shareItems
  //
  //----------------------------------

  @aliasOf("viewModel.shareItems")
  @renderable()
  shareItems: Collection<ShareItem> = null;

  //----------------------------------
  //
  //  shareLocationEnabled
  //
  //----------------------------------

  @aliasOf("viewModel.shareLocationEnabled")
  @renderable()
  shareLocationEnabled: boolean = null;

  //----------------------------------
  //
  //  shortenLinkEnabled
  //
  //----------------------------------
  @aliasOf("viewModel.shortenLinkEnabled")
  @renderable()
  shortenLinkEnabled: boolean = null;

  //----------------------------------
  //
  //  iconClass
  //
  //----------------------------------

  @property() iconClass = CSS.icons.widgetIcon;

  //----------------------------------
  //
  //  label
  //
  //----------------------------------

  @property() label = i18n.widgetLabel;

  //----------------------------------
  //
  //  viewModel
  //
  //----------------------------------

  @renderable(["viewModel.state"])
  @property({
    type: ShareViewModel
  })
  viewModel: ShareViewModel = new ShareViewModel();

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------

  render() {
    const { state, shareLocationEnabled } = this.viewModel;
    const shareItemNodes = this._renderShareItems();
    const shareItemNode =
      state === "ready" && shareItemNodes.length ? [shareItemNodes] : null;
    const inputSubheader = this.linkGenerated
      ? i18n.clipboard
      : i18n.generateLink;
    const copyIconNode = (
      <div
        bind={this}
        onclick={this._copyUrl}
        onkeydown={this._copyUrl}
        role="button"
        tabIndex={0}
        class={CSS.main.mainCopy.copyClipboard}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          class={this.classes(CSS.icons.svgIcon, CSS.icons.copyIcon)}
        >
          <path d="M22.801 0H10v6H2v26h20v-6h8V7.199L22.801 0zM20 24v6H4V8h8v8h8v8zm0-10h-6V8h.621L20 13.381V14zm8 10h-6V13.199L14.801 6H12V2h8v8h8v14zm0-16h-6V2h.621L28 7.381V8zM6 26h12v2H6v-2zm0-4h12v2H6v-2zm0-4h12v2H6v-2zm0-4h4v2H6v-2z" />
        </svg>
      </div>
    );
    const shortenIconNode = (
      <div
        bind={this}
        onclick={this._shortenShareUrl}
        onkeydown={this._shortenShareUrl}
        role="button"
        tabIndex={0}
        class={CSS.main.mainShorten.shortenUrl}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          class={this.classes(CSS.icons.svgIcon, CSS.icons.shortenIcon)}
        >
          <path d="M27.443 9.439l-4.955-4.953 1.652-1.65a2.337 2.337 0 0 1 3.301 0l1.648 1.65a2.33 2.33 0 0 1 .004 3.299l-1.65 1.654zM4.924 22.195l-2.373 7.254 7.328-2.301-4.955-4.953zM20.455 6.713L7.379 19.555l4.951 4.949 13.074-12.842-4.949-4.949z" />
        </svg>
      </div>
    );
    const loadingIconNode = this.shortenLinkEnabled ? (
      this.loading ? (
        <div class={CSS.main.mainShorten.loading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            class={this.classes(
              CSS.icons.svgIcon,
              CSS.icons.esriRotatingIcon,
              CSS.icons.loadingIcon
            )}
          >
            <path d="M27.518 8.338c.324.37.772.94 1.261 1.727a13.499 13.499 0 0 1 1.986 7.41c-.019 3.243-1.41 7.185-4.559 10.081-3.085 2.902-7.94 4.492-12.611 3.566-4.697-.832-8.864-4.161-10.853-8.38-2.043-4.23-1.863-9.035-.373-12.647 1.463-3.672 4.051-6.09 6.098-7.421C10.551 1.336 12.092.889 12.389.802c1.234-.356 2.457-.18 3.282.309.839.511 1.281 1.259 1.276 2.105-.079 1.717-1.406 3.039-2.86 3.478-.19.051-1.158.258-2.564.99a10.6 10.6 0 0 0-4.43 4.522c-1.216 2.318-1.698 5.672-.504 8.872 1.158 3.185 4.042 6.059 7.693 7.058 3.629 1.078 7.773.199 10.671-2.06 2.944-2.244 4.563-5.648 4.855-8.66.369-3.046-.465-5.615-1.261-7.222a13.163 13.163 0 0 0-1.084-1.812l-.45-.601.504.559z" />
          </svg>
        </div>
      ) : null
    ) : null;
    const copyShortenNode = this.linkGenerated ? copyIconNode : shortenIconNode;
    return (
      <div class={CSS.base}>
        <div class={CSS.header.container}>
          <h1 class={CSS.header.heading}>{i18n.heading}</h1>
          {loadingIconNode}
        </div>
        <div class={CSS.main.mainContainer}>
          <div class={CSS.main.mainLocation.shareLocationContainer}>
            <label class={CSS.main.mainInputLabel}>
              <input
                class={CSS.main.mainLocation.shareLocation}
                checked={shareLocationEnabled}
                type="checkbox"
                onclick={this._toggleShareLocation}
                bind={this}
              />
              {i18n.shareLocation}
            </label>
          </div>
          <div class={CSS.main.mainCopy.copyContainer}>
            <h2 class={CSS.main.mainHeader}>
              {this.shortenLinkEnabled ? inputSubheader : i18n.clipboard}
            </h2>
            <div class={CSS.main.mainUrl.inputGroup}>
              {this.shortenLinkEnabled ? copyShortenNode : copyIconNode}
              {this.shortenLinkEnabled ? (
                <input
                  class={CSS.main.mainUrl.urlInput}
                  type="text"
                  onclick={this._copyUrl}
                  onkeydown={this._copyUrl}
                  value={this.shortenedUrl ? this.shortenedUrl : this.shareUrl}
                  afterCreate={storeNode}
                  bind={this}
                  data-node-ref="_urlNode"
                  readOnly
                />
              ) : (
                <input
                  class={CSS.main.mainUrl.urlInput}
                  onclick={this._copyUrl}
                  onkeydown={this._copyUrl}
                  type="text"
                  value={this.shareUrl}
                  afterCreate={storeNode}
                  bind={this}
                  data-node-ref="_urlNode"
                  readOnly
                />
              )}
            </div>
          </div>
          <hr class={CSS.main.mainHR} />
          <div class={CSS.main.mainShare.shareContainer}>
            <h2 class={CSS.main.mainHeader}>{i18n.subHeading}</h2>
            {shareItemNode}
          </div>
        </div>
      </div>
    );
  }

  @accessibleHandler()
  private _toggleShareLocation(): void {
    this.viewModel.shareLocationEnabled = !this.viewModel.shareLocationEnabled;
  }

  private _shortenShareUrl(): IPromise<string> {
    return this.viewModel.shorten().then(shortenedUrl => {
      return shortenedUrl;
    });
  }

  @accessibleHandler()
  private _copyUrl(): void {
    this._urlNode.select();
    document.execCommand("copy");
  }

  @accessibleHandler()
  private _processShareItem(event: Event): void {
    const node = event.currentTarget as Element;
    const shareItem = node["data-share-item"] as ShareItem;
    const { urlTemplate } = shareItem;
    const portalItem = this.get("view.map.portalItem");
    const title = portalItem
      ? substitute({ title: portalItem.title }, i18n.urlTitle)
      : null;
    const summary = portalItem
      ? substitute({ summary: portalItem.snippet }, i18n.urlSummary)
      : null;
    if (this.shortenLinkEnabled) {
      this._shortenShareUrl().then(res => {
        this._openUrl(res, title, summary, urlTemplate);
      });
      return;
    }
    this._openUrl(this.shareUrl, title, summary, urlTemplate);
  }

  private _openUrl(
    url: string,
    title: string,
    summary: string,
    urlTemplate: string
  ): void {
    const urlToOpen = substitute(
      {
        url: encodeURI(url),
        title,
        summary
      },
      urlTemplate
    );
    window.open(urlToOpen);
  }

  private _renderShareItem(shareItem: ShareItem): any {
    const { name, className } = shareItem;
    return (
      <a
        bind={this}
        data-share-item={shareItem}
        class={this.classes(CSS.main.mainShare.shareItem, name)}
        title={name}
        onclick={this._processShareItem}
        onkeydown={this._processShareItem}
        role="button"
        tabIndex={0}
        aria-label={name}
      >
        <span class={className} />
      </a>
    );
  }
  private _renderShareItems(): any[] {
    const { shareItems } = this;
    const { shareIcons } = CSS.main.mainShare;
    // Assign class names of icons to share item
    shareItems.items.forEach((shareItem: any) => {
      for (const key in shareIcons) {
        if (key === shareItem.id) {
          shareItem.className = shareIcons[shareItem.id];
        }
      }
    });
    return shareItems
      .toArray()
      .map(shareItems => this._renderShareItem(shareItems));
  }
}

export = Share;
