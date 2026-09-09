import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TinymceEditorService {

  tinymceOptions: any;

  constructor() { }

  getTinymceOptions(): Observable<any> {
    this.tinymceOptions = {
      selector: 'textarea#basic-example',
      height: 500,
      plugins: [
        'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
        'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
        'media', 'table', 'emoticons', 'template', 'help'
      ],
      toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
        'forecolor backcolor emoticons | help',
      
      //Custom menü için örnek.(F.Z)
      // menu: {
      //   favs: { title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons' }
      // },
      // menubar: 'favs file edit view insert format tools table help',
    }
    return this.tinymceOptions;
  }

}
