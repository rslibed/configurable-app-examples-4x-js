/*
  Copyright 2017 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/

import ApplicationBase = require("ApplicationBase/ApplicationBase");

import i18n = require("dojo/i18n!./nls/resources");

import ShareWidget = require("Share/ShareWidget");
import ShareItem = require("Share/Share/ShareItem");
import ExpandWidget = require("esri/widgets/Expand");

const CSS = {
  loading: "configurable-application--loading"
};

import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";

import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";

import {
  ApplicationConfig,
  ApplicationBaseSettings
} from "ApplicationBase/interfaces";

class MapExample {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  ApplicationBase
  //----------------------------------
  base: ApplicationBase = null;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  public init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    this.base = base;

    const { config, results, settings } = base;
    const { find, marker } = config;
    const { webMapItems } = results;

    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];

    if (!firstItem) {
      console.error("Could not load an item to display");
      return;
    }

    config.title = !config.title ? getItemTitle(firstItem) : "";
    setPageTitle(config.title);

    // todo: Typings will be fixed in next release.
    const portalItem: any = this.base.results.applicationItem.value;
    const appProxies =
      portalItem && portalItem.appProxies ? portalItem.appProxies : null;

    const viewContainerNode = document.getElementById("viewContainer");
    const defaultViewProperties = getConfigViewProperties(config);

    validWebMapItems.forEach(item => {
      const viewNode = document.createElement("div");
      viewContainerNode.appendChild(viewNode);

      const container = {
        container: viewNode
      };

      const viewProperties = {
        ...defaultViewProperties,
        ...container
      };

      const { basemapUrl, basemapReferenceUrl } = config;

      createMapFromItem({ item, appProxies }).then(map =>
        createView({
          ...viewProperties,
          map
        }).then(view => {
          const shareContainer = document.createElement("div");
          const PINTEREST_ITEM = new ShareItem({
            id: "pinterest",
            name: "pinterest",
            urlTemplate:
              "https://pinterest.com/pin/create/bookmarklet?&url={url}"
          });
          const REDDIT_ITEM = new ShareItem({
            id: "reddit",
            name: "Reddit",
            className: "icon-social-share",
            urlTemplate: "https://reddit.com/submit?url={url}"
          });
          const LINKED_IN = new ShareItem({
            id: "linkedin",
            name: "LinkedIn",
            className: "icon-social-linkedin",
            urlTemplate: "https://linkedin.com/shareArticle?url={url}"
          });
          const shareItems = [PINTEREST_ITEM, LINKED_IN, REDDIT_ITEM];
          const share = new ShareWidget({
            view,
            container: shareContainer
            // shortenLinkEnabled: false,
            // shareItems
          });
          const expand = new ExpandWidget({
            expandIconClass: "esri-icon-share",
            view,
            content: share,
            expanded: true
          });
          view.ui.add(expand, "top-right");
          findQuery(find, view).then(() => goToMarker(marker, view));
        })
      );
    });

    document.body.classList.remove(CSS.loading);
  }
}

export = MapExample;
