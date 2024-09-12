import * as Model from 'devexpress-dashboard/model';
import {
  ICustomItemExtension,
  CustomItemViewer,
} from 'devexpress-dashboard/common';
import { ICustomItemMetaData } from 'devexpress-dashboard/model/items/custom-item/meta';
import OLCesium from 'olcs';
import olView from 'ol/View.js';
import olSourceOSM from 'ol/source/OSM.js';
import olLayerTile from 'ol/layer/Tile.js';
import { transform } from 'ol/proj.js';
import olMap from 'ol/Map.js';
window['CESIUM_BASE_URL'] = '/assets/cesium/';
declare const Cesium: typeof import('cesium');

const MAP_EXTENSION_NAME = '3D Map';

const svgIcon =
  `<?xml version="1.0" encoding="utf-8"?>        
        <svg version = "1.1" id = "` +
  MAP_EXTENSION_NAME +
  `" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" viewBox = "0 0 24 24" style = "enable-background:new 0 0 24 24;" xml: space = "preserve" >
            <path class="dx-dashboard-contrast-icon" d="M20.7,4.7l-3.4-3.4C17.1,1.1,16.9,1,16.6,1H4C3.4,1,3,1.4,3,2v20c0,0.6,0.4,1,1,1h16
	        c0.6,0,1-0.4,1-1V5.4C21,5.1,20.9,4.9,20.7,4.7z M19,21H5V3h11v2c0,0.6,0.4,1,1,1h2V21z"/>
            <path class="dx-dashboard-accent-icon" d="M12,8c-1.1,0-2.2,0.3-3.1,0.9H9c1,0.2,3.1,0.7,3.1,0.3S12,8.3,12.2,8.4
	        c0.2,0.2,0.8,0.7,0.6,1S12,10,12.2,10.3c0.2,0.2,0.8,0.6,1,0.4s-0.1-0.9,0.2-0.8c0.3,0,1.8,0.8,1.3,1.1s-1.4,1.9-1.9,2
	        s-0.9,0.2-0.8,0.6c0.2,0.5,0.5,0.2,0.7,0.3c0.1,0.1,0.1,0.4,0.3,0.6s0.4,0.1,0.7,0.1c0.3-0.1,2.5,0.9,2.3,1.4
	        c-0.2,0.5-0.2,1.2-1,2.1c-0.5,0.5-0.7,1.1-0.9,1.5c2.3-0.8,4-3,4-5.6C18,10.7,15.3,8,12,8z"/>
        </svg>`;

const mapMeta: ICustomItemMetaData = {
  customProperties: [
    {
      ownerType: Model.CustomItem,
      propertyName: 'Zoom',
      valueType: 'number',
      defaultValue: 17,
    },
    {
      ownerType: Model.CustomItem,
      propertyName: 'Latitude',
      valueType: 'number',
      defaultValue: 53.220481, // Default latitude
    },
    {
      ownerType: Model.CustomItem,
      propertyName: 'Longitude',
      valueType: 'number',
      defaultValue: 6.566263, // Default longitude
    },
    {
      ownerType: Model.CustomItem,
      propertyName: 'TerrainDataUrl',
      valueType: 'string',
      defaultValue:
        'https://www.nederlandin3d.nl/viewer/datasource-data/882a9596-4d32-479a-a130-33cfbc713696', // Default terrain data URL
    },
    {
      ownerType: Model.CustomItem,
      propertyName: 'TilesetUrl',
      valueType: 'string',
      defaultValue:
        'https://3dtilesnederland.nl/tiles/1.0/implicit/nederland/14.json', // Default 3D tileset URL
    },
  ],
  optionsPanelSections: [
    {
      title: 'Map Options',
      items: [
        {
          dataField: 'Zoom',
          editorType: 'dxNumberBox',
          editorOptions: {
            min: 0,
            max: 20,
          },
        },
        {
          dataField: 'Latitude',
          editorType: 'dxNumberBox',
          editorOptions: {
            min: -90,
            max: 90,
          },
        },
        {
          dataField: 'Longitude',
          editorType: 'dxNumberBox',
          editorOptions: {
            min: -180,
            max: 180,
          },
        },
        {
          dataField: 'TerrainDataUrl',
          editorType: 'dxTextBox',
        },
        {
          dataField: 'TilesetUrl',
          editorType: 'dxTextBox',
        },
      ],
    },
  ],
  icon: MAP_EXTENSION_NAME,
  title: MAP_EXTENSION_NAME,
};

export class OpenLayersMapExtension implements ICustomItemExtension {
  name = MAP_EXTENSION_NAME;
  metaData = mapMeta;

  constructor(dashboardControl: any) {
    dashboardControl.registerIcon(svgIcon);
  }

  public createViewerItem = (model: any, element: any, content: any) => {
    return new OpenLayersMapItem(model, element, content);
  };
}

export class OpenLayersMapItem extends CustomItemViewer {
  private map?: olMap;
  private ol3d?: OLCesium;

  constructor(model: any, container: any, options: any) {
    super(model, container, options);
  }

  override renderContent(
    element: HTMLElement,
    changeExisting: boolean,
    afterRenderCallback?: any
  ) {
    if (!changeExisting || !this.map) {
      while (element.firstChild) element.removeChild(element.firstChild);

      // Get custom property values and cast them to the correct types
      const latitude = this.getPropertyValue('Latitude') as number;
      const longitude = this.getPropertyValue('Longitude') as number;
      const terrainDataUrl = this.getPropertyValue('TerrainDataUrl') as string;
      const tilesetUrl = this.getPropertyValue('TilesetUrl') as string;
      const zoom = this.getPropertyValue('Zoom') as number;

      // Initialize the 2D map
      this.map = new olMap({
        target: element,
        layers: [
          new olLayerTile({
            source: new olSourceOSM(),
          }),
        ],
        view: new olView({
          center: transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'),
          zoom: zoom,
        }),
      });

      // Initialize OLCesium for 3D view
      this.ol3d = new OLCesium({
        map: this.map,
      });

      const scene = this.ol3d.getCesiumScene();

      // Load terrain data
      Cesium.CesiumTerrainProvider.fromUrl(terrainDataUrl).then((tp) => {
        scene.terrainProvider = tp;
      });

      // Load and style the 3D tileset
      Cesium.Cesium3DTileset.fromUrl(tilesetUrl).then((tileset) => {
        scene.primitives.add(tileset);
      });

      this.ol3d.setEnabled(true);
    }
  }
}
