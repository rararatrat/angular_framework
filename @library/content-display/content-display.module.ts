import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@eagna-io/core';
import { EgAutocompleteComponent } from './eg-autocomplete/eg-autocomplete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InplaceComponent } from './inplace/inplace.component';
import { SelectComponent } from './select/select.component';
import { ImageComponent } from './image/image.component';
import { AddressComponent } from './address/address.component';
import { NoDataFoundComponent } from './no-data-found/no-data-found.component';
import { CrudFormComponent } from './crud-form/crud-form.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { MapComponent } from './map/map.component';
import { UploaderComponent } from './uploader/uploader.component';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { GalleryModule } from  'ng-gallery';
import { LIGHTBOX_CONFIG, LightboxModule } from  'ng-gallery/lightbox';
import { GALLERY_CONFIG } from 'ng-gallery';
import { StepperComponent } from './stepper/stepper.component';

//import { SyncModule } from '@library/sync/sync.module';

/* import { PdfViewerModule, LinkAnnotationService, BookmarkViewService,
  MagnificationService, ThumbnailViewService, ToolbarService,
  NavigationService, TextSearchService, TextSelectionService,
  PrintService
} from '@syncfusion/ej2-angular-pdfviewer'; */



const component : any = [
  EgAutocompleteComponent,
  SelectComponent,
  InplaceComponent,
  ImageComponent,
  AddressComponent,
  NoDataFoundComponent,
  CrudFormComponent,
  MultiSelectComponent,
  TextAreaComponent,
  MapComponent,
  UploaderComponent,
  ImageGalleryComponent,
  StepperComponent

];
const module : any = [
  CommonModule,
  CoreModule,
  FormsModule,
  ReactiveFormsModule,
  GalleryModule,
  LightboxModule
  ];
const service : any = [
  {
    provide: GALLERY_CONFIG,
    useValue: {
      dots: true,
      imageSize: 'cover',
      /* thumbAutosize:true,
      itemAutosize:true */
    }
  },
  {
    provide: LIGHTBOX_CONFIG,
    useValue: {
      keyboardShortcuts: false
    }
  }
];


@NgModule({
  declarations: [].concat(component),
  imports: [].concat(module),
  exports: [].concat(component),
  providers: [].concat(service),
})
export class ContentDisplayModule { }
