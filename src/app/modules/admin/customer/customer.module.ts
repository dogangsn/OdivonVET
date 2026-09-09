import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
const routes: Routes = [
    {
        path: 'customerlist',
        loadChildren: () =>
            import(
                'app/modules/admin/customer/customerlist/customerlist.module'  
            ).then((m) => m.CustomerListModule),
    },
]

@NgModule({
    declarations: [
        // customerlistReportComponent,
        
    ],
    imports: [
      CommonModule,

      RouterModule.forChild(routes)
    ]
  })
  export class CustomerModule { }