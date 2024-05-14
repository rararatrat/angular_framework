import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { INoDataFound } from '@library/library.interface';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { PrimeNGConfig } from 'primeng/api';
import { Galleria } from 'primeng/galleria';

@Component({
  selector: 'eg-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,


})
export class ImageGalleryComponent implements OnInit, OnDestroy {

  @Input('type') type : "grid" | "carousel" | "gallery" = "carousel";

  @Input('width') width : string = '55px';
  /* @Input('width') width : string; */

  @Input('images') images : any[] = [{ id: 1, file: 'image1.jpg', alt: 'Image 1' }];
  @Output('imagesChange') imagesChange : any = new EventEmitter();

  @ContentChild('imageTemplate') imageTemplateRef: TemplateRef<any>;

  noDataConfig        : INoDataFound;
  showThumbnails      : boolean;
  fullscreen          : boolean = false;
  activeIndex         : number = 0;
  onFullScreenListener: any;
  isLoading           : boolean = true;
  responsiveOptions   : any[];

  imageGallery        : GalleryItem[] = [];
  galleryId           = 'myLightbox';

  public testCfg : PrimeNGConfig
  public afterViewInitLoaded = false;
  constructor(public gallery: Gallery, private cdr: ChangeDetectorRef){}

  ngOnInit() {
    this.responsiveOptions = [
      {
          breakpoint: '1024px',
          numVisible: 5
      },
      {
          breakpoint: '768px',
          numVisible: 3
      },
      {
          breakpoint: '560px',
          numVisible: 1
      }

  ];

  if(this.type == "gallery"){
    if(this.images.length > 0){
      this.images.forEach( e => {
        const temp = new ImageItem({src: e.file, thumb:e.file, alt:e.name})
        this.imageGallery.push(temp);
      })
    }

    const galleryRef = this.gallery.ref(this.galleryId);
    galleryRef.load(this.imageGallery);
  }
  this.noDataConfig = {
    action : "Add",
    message: "No Image Available",
    hasCallback : false,
    icon : "fa-solid fa-comment-slash"
  }
}

  ngAfterViewInit(){

    setTimeout(() => {
      this.afterViewInitLoaded = true;
      this.cdr.detectChanges();
    })
  }

  ngOnDestroy() {

  }

}
