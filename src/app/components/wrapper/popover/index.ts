// Reference link : https://github.com/pleerock/ngx-popover

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Popover } from "./Popover";
import { PopoverContent } from "./PopoverContent";

export * from "./Popover";
export * from "./PopoverContent";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PopoverContent,
        Popover,
    ],
    exports: [
        PopoverContent,
        Popover,
    ],
    entryComponents: [
        PopoverContent
    ]
})
export class PopoverModule {

}