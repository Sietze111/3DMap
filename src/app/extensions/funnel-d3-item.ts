import { ICustomItemExtension, CustomItemViewer } from 'devexpress-dashboard/common';
import { FormItemTemplates } from 'devexpress-dashboard/designer';
import * as Model from 'devexpress-dashboard/model';
import { ICustomItemMetaData } from 'devexpress-dashboard/model/items/custom-item/meta';
import D3Funnel from 'd3-funnel';
import $ from 'jquery';

const FUNNEL_D3_EXTENSION_NAME = 'FunnelD3';

const svgIcon = '<?xml version="1.0" encoding="utf-8"?><!-- Generator: Adobe Illustrator 21.0.2, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="' + FUNNEL_D3_EXTENSION_NAME + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><polygon class="dx_green" points="2,1 22,1 16,8 8,8 "/><polygon class="dx_blue" points="8,9 16,9 14,15 10,15 "/><polygon class="dx_red" points="10,16 14,16 13,23 11,23 "/></svg>';

const funnelMeta: ICustomItemMetaData = {
  bindings: [{
      propertyName: 'Values',
      dataItemType: 'Measure',
      array: true,
      enableColoring: true,
      displayName: 'Values',
      emptyPlaceholder: 'Set Value',
      selectedPlaceholder: 'Configure Value'
  }, {
      propertyName: 'Arguments',
      dataItemType: 'Dimension',
      array: true,
      enableInteractivity: true,
      enableColoring: true,
      displayName: 'Arguments',
      emptyPlaceholder: 'Set Argument',
      selectedPlaceholder: 'Configure Argument'
  }],
  customProperties: [{
      ownerType: Model.CustomItem,
      propertyName: 'FillType',
      valueType: 'string',
      defaultValue: 'Solid',
  },{
      ownerType: Model.CustomItem,
      propertyName: 'IsCurved',
      valueType: 'boolean',
      defaultValue: false,
  },{
      ownerType: Model.CustomItem,
      propertyName: 'IsDynamicHeight',
      valueType: 'boolean',
      defaultValue: true,
  }, {
      ownerType: Model.CustomItem,
      propertyName: 'PinchCount',
      valueType: 'number',
      defaultValue: 0,
  }],
  optionsPanelSections: [{
      title: 'Settings',
      items: [{
          dataField: 'FillType',
          template: FormItemTemplates.buttonGroup,
          editorOptions: {
              items: [{ text: 'Solid' }, { text: 'Gradient' }]
          },
      },{
          dataField: 'IsCurved',
          label: {
              text: 'Curved'
          },
          template: FormItemTemplates.buttonGroup,
          editorOptions: {
              keyExpr: 'value',
              items: [{
                  value: false,
                  text: 'No',
              }, {
                  value: true,
                  text: 'Yes',
              }]
          },
      },{
          dataField: 'IsDynamicHeight',
          label: {
              text: 'Dynamic Height'
          },
          template: FormItemTemplates.buttonGroup,
          editorOptions: {
              keyExpr: 'value',
              items: [{
                  value: false,
                  text: 'No',
              }, {
                  value: true,
                  text: 'Yes',
              }]
          },
      }, {
          dataField: 'PinchCount',
          editorType: 'dxNumberBox',
          editorOptions: {
              min: 0,
          },
      }],
  }],
  interactivity: {
      filter: true,
      drillDown: true
  },
  icon: FUNNEL_D3_EXTENSION_NAME,
  title: 'Funnel D3',
  index: 3
};
class FunnelD3ItemViewer extends CustomItemViewer {
  funnelSettings;
  funnelViewer;
  selectionValues: Array<any>
  exportingImage: HTMLImageElement;
  funnelContainer: HTMLElement;

  constructor(model, container, options) {
      super(model, container, options);

      this.funnelSettings = undefined;
      this.funnelViewer = null;
      this.selectionValues = [];
      this.exportingImage = new Image();
      this._subscribeProperties();
  }

  override renderContent(element, changeExisting) {
      let htmlElement: HTMLElement = element instanceof $ ? (<JQuery>element).get(0): <HTMLElement>(<any>element);

      var data = this._getDataSource();
      if(!this._ensureFunnelLibrary(htmlElement))
          return;
      if(!!data) {
          if(!changeExisting || !this.funnelViewer) {
              while(htmlElement.firstChild)
                  htmlElement.removeChild(htmlElement.firstChild);

              this.funnelContainer = document.createElement('div');
              this.funnelContainer.style.margin = '20px';
              this.funnelContainer.style.height = 'calc(100% - 40px)'

              htmlElement.appendChild(this.funnelContainer);
              this.funnelViewer = new D3Funnel(this.funnelContainer);
          }
          this._update(data, this._getFunnelSizeOptions());
      } else {
          while(htmlElement.firstChild)
              htmlElement.removeChild(htmlElement.firstChild);

          this.funnelViewer = null;
      }
  };
  override setSize (width, height) {
      super.setSize(width, height);
      this._update(null, this._getFunnelSizeOptions());
  };
  override setSelection(values: Array<Array<any>>) {
      super.setSelection(values);
      this._update(this._getDataSource());
  };
  override clearSelection() {
      super.clearSelection();
      this._update(this._getDataSource());
  };
  override allowExportSingleItem() {
      return !this._isIEBrowser();
  };
  override getExportInfo () {
      if (this._isIEBrowser())
          return void 0;
      return {
          image: this._getImageBase64()
      };
  };
  _getFunnelSizeOptions () {
      if(!this.funnelContainer)
          return { };

      return { chart: { width: this.funnelContainer.clientWidth,  height:this.funnelContainer.clientHeight } };
  };
  _getDataSource() {
      var bindingValues = this.getBindingValue('Values');
      if(bindingValues.length == 0)
          return undefined;
      var data = [];
      this.iterateData((dataRow) => {
          var values = dataRow.getValue('Values');
          var valueStr = dataRow.getDisplayText('Values');
          var color = dataRow.getColor('Values');
          if(this._hasArguments()) {
              var labelText = dataRow.getDisplayText('Arguments').join(' - ') + ': ' + valueStr;
              data.push([{ data: dataRow, text: labelText, color: color[0] }].concat(values));//0 - 'layer' index for color value
          } else {
              data = values.map((value, index) => { return [{ text: bindingValues[index].displayName() + ': ' + valueStr[index], color: color[index] }, value]; });
          }
      });
      return data.length > 0 ? data : undefined;
  };
  _ensureFunnelLibrary(htmlElement: HTMLElement) {
      if(!D3Funnel) {

          htmlElement.innerHTML = '';
          var textDiv = document.createElement('div');
          textDiv.style.position= 'absolute';
          textDiv.style.top= '50%';
          textDiv.style.transform= 'translateY(-50%)';
          textDiv.style.width= '95%';
          textDiv.style.color= '#CF0F2E';
          textDiv.style.textAlign= 'center';
          textDiv.innerText = "'D3Funnel' cannot be displayed. You should include 'd3.v3.min.js' and 'd3-funnel.js' libraries."
          htmlElement.appendChild(textDiv);
          return false;
      }
      return true;
  };
  _ensureFunnelSettings() {

      var getSelectionColor = (hexColor) => { return this.funnelViewer.colorizer.shade(hexColor, -0.5); };
      if(!this.funnelSettings) {
          this.funnelSettings = {
              data: undefined,
              options: {
                  chart: {
                      bottomPinch: this.getPropertyValue('PinchCount'),
                      curve: { enabled: this.getPropertyValue('IsCurved') }
                  },
                  block: {
                      dynamicHeight: this.getPropertyValue('IsDynamicHeight'),
                      fill: {
                          scale: (index) => {
                              var obj = this.funnelSettings.data[index][0];
                              return obj.data && this.isSelected(obj.data) ? getSelectionColor(obj.color) : obj.color;
                          },
                          type: (<string>this.getPropertyValue('FillType')).toLowerCase()
                      }
                  },
                  label: {
                      format: (label, value) => {
                          return label.text;
                      }
                  },
                  events: {
                      click: { block: (e) => this._onClick(e) }
                  }
              }
          };
      }
      this.funnelSettings.options.block.highlight = this.canDrillDown() || this.canMasterFilter();
      return this.funnelSettings;
  };
  _onClick(e) {
      if(!this._hasArguments() || !e.label)
          return;
      var row = e.label.raw.data;
      if (this.canDrillDown(row))
          this.drillDown(row);
      else if (this.canMasterFilter(row)) {
          this.setMasterFilter(row);
          this._update();
      }
  };
  _subscribeProperties() {
      this.subscribe('IsCurved', (isCurved) => this._update(null, { chart: { curve: { enabled: isCurved } } }) );
      this.subscribe('IsDynamicHeight', (isDynamicHeight) => this._update(null, { block: { dynamicHeight: isDynamicHeight } }));
      this.subscribe('PinchCount', (count) => this._update(null, { chart: { bottomPinch: count } }));
      this.subscribe('FillType', (type)=> this._update(null, { block: { fill: { type: type.toLowerCase() } } }));
  };
  _update(data?, options?) {
      this._ensureFunnelSettings();
      if(!!data) {
          this.funnelSettings.data = data;
      }
      if(!!options) {
          $.extend(true, this.funnelSettings.options, options);
      }
      if(!!this.funnelViewer) {
          this.funnelViewer.draw(this.funnelSettings.data, this.funnelSettings.options);
          this._updateExportingImage();
      }
  };
  _updateExportingImage () {
      var svg = this.funnelContainer.firstElementChild,
          str = new XMLSerializer().serializeToString(svg),
          encodedData = 'data:image/svg+xml;base64,' + window.btoa(window["unescape"](encodeURIComponent(str)));
      this.exportingImage.src = encodedData;
  };
  _hasArguments() {
      return this.getBindingValue('Arguments').length > 0;
  };
  _getImageBase64 () {
      var canvas = document.createElement('canvas');;


      canvas.width = this.funnelContainer.clientWidth;
      canvas.height = this.funnelContainer.clientHeight;
      canvas.getContext('2d').drawImage(this.exportingImage, 0, 0);
      return canvas.toDataURL().replace('data:image/png;base64,', '');
  }
  _isIEBrowser () {
      return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
  }
}

export class FunnelD3ItemExtension implements ICustomItemExtension {
    name = FUNNEL_D3_EXTENSION_NAME;
    metaData = funnelMeta;

    constructor(dashboardControl: any) {
        dashboardControl.registerIcon(svgIcon);
    }

    public createViewerItem = (model: any, element: any, content: any) => {
        return new FunnelD3ItemViewer(model, element, content);
    }
}
