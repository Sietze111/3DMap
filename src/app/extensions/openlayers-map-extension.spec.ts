// import { OnlineMapItemExtension, OnlineMapItem } from './online-map-item';
// import { ICustomItemExtension } from 'devexpress-dashboard/common';
// import olMap from 'ol/Map';
// import OLCesium from 'olcs';

// describe('OpenLayersMapExtension', () => {
//   let extension: OnlineMapItemExtension;
//   let dashboardControlMock: any;

//   beforeEach(() => {
//     dashboardControlMock = {
//       registerIcon: jasmine.createSpy('registerIcon'),
//     };
//     extension = new OnlineMapItemExtension(dashboardControlMock);
//   });

//   it('should be an instance of ICustomItemExtension', () => {
//     expect(extension).toBeTruthy();
//     expect(extension.name).toBe('3D Map');
//     expect(extension.metaData).toBeDefined();
//   });

//   it('should register icon on initialization', () => {
//     expect(dashboardControlMock.registerIcon).toHaveBeenCalled();
//   });

//   it('should create a viewer item', () => {
//     const modelMock = {};
//     const elementMock = document.createElement('div');
//     const contentMock = {};

//     const viewerItem = extension.createViewerItem(
//       modelMock,
//       elementMock,
//       contentMock
//     );
//     expect(viewerItem).toBeTruthy();
//     expect(viewerItem instanceof OnlineMapItem).toBeTrue();
//   });
// });

// describe('OpenLayersMapItem', () => {
//   let mapItem: OnlineMapItem;
//   let modelMock: any;
//   let containerMock: HTMLElement;
//   let optionsMock: any;

//   beforeEach(() => {
//     modelMock = {
//       getPropertyValue: jasmine
//         .createSpy('getPropertyValue')
//         .and.returnValue(0),
//     };
//     containerMock = document.createElement('div');
//     optionsMock = {};
//     mapItem = new OnlineMapItem(modelMock, containerMock, optionsMock);
//   });

//   it('should create a new instance of OpenLayersMapItem', () => {
//     expect(mapItem).toBeTruthy();
//   });

//   it('should render content', () => {
//     spyOn(olMap.prototype, 'setTarget').and.callThrough();
//     spyOn(OLCesium.prototype, 'setEnabled').and.callThrough();

//     mapItem.renderContent(containerMock, false);

//     expect(olMap.prototype.setTarget).toHaveBeenCalled();
//     expect(OLCesium.prototype.setEnabled).toHaveBeenCalledWith(true);
//   });

//   it('should load and apply terrain data and 3D tileset', () => {
//     const mockScene = {
//       terrainProvider: null,
//       primitives: {
//         add: jasmine.createSpy('add'),
//       },
//     };

//     spyOn(OLCesium.prototype, 'getCesiumScene').and.returnValue(mockScene);
//     spyOn(Cesium.CesiumTerrainProvider, 'fromUrl').and.returnValue(
//       Promise.resolve('terrainProviderMock')
//     );
//     spyOn(Cesium.Cesium3DTileset, 'fromUrl').and.returnValue(
//       Promise.resolve('tilesetMock')
//     );

//     mapItem.renderContent(containerMock, false);

//     expect(OLCesium.prototype.getCesiumScene).toHaveBeenCalled();
//     Cesium.CesiumTerrainProvider.fromUrl().then(() => {
//       expect(mockScene.terrainProvider).toBe('terrainProviderMock');
//     });
//     Cesium.Cesium3DTileset.fromUrl().then(() => {
//       expect(mockScene.primitives.add).toHaveBeenCalledWith('tilesetMock');
//     });
//   });
// });
