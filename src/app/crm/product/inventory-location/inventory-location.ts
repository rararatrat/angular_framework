import { objArrayType } from "@library/library.interface";
import { InventoryLocationComponent } from "./inventory-location.component";

export class InventoryLocation {
  public static getFormProperties(_that: InventoryLocationComponent): any{
    const _formProperties: objArrayType = {
      address             : {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{extraKey:"contact_address"}, callback: (p, _f) => {
        _that.onAddressChanged(p, _f);
      }},
      country             : {icon:"fa-solid fa-globe", type:"select", autoConfig: {title: 'name', description: 'name', icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}, displayVal: "name"},
    };

  const _toReturn   : any = {
      formProperties  : _formProperties,
      formStructure   : [
      {
        header    : "Select Address",
        fields    : ["address"],
        isTwoLine : false
      },
      {
        header    : "Details",
        fields    : ["name", "city", "state", "country", "lat", "lon",],
        isTwoLine : false
      },
      {
        header    : "Files",
        subheader : "Upload Any Images, Documents of the Area",
        fields    : [ "files"],
        isTwoLine : true
      },
      ]
    }

    return _toReturn;
  }

}
