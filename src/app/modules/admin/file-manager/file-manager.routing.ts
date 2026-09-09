import { Route } from '@angular/router';
import { FileUploadDialogComponent } from './file-upload-dialog/file-upload-dialog.component';
import { FileManagerDetailsComponent } from './details/details.component';
import { FileManagerComponent } from './file-manager.component';
import { CanDeactivateFileManagerDetails, FileManagerFolderResolver, FileManagerItemResolver, FileManagerItemsResolver } from './file-manager.resolvers';
import { FileManagerListComponent } from './list/list.component';

export const fileManagerRoutes: Route[] = [
    {
        path: '',
        component: FileManagerComponent,
        children: [
            {
                path: 'folders/:folderId',
                component: FileManagerListComponent,

                children: [
                    {
                        path: 'details/:id',
                        component: FileManagerDetailsComponent,
                        resolve: {
                            item: FileManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateFileManagerDetails]
                    }
                ]
            },
            {
                path: '',
                component: FileManagerListComponent,
                resolve: {
                    items: FileManagerItemsResolver
                },
                children: [
                    {
                        path: 'details/:id',
                        component: FileManagerDetailsComponent,
                        resolve: {
                            item: FileManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateFileManagerDetails]
                    }
                ]
            }
        ]
    }
];
