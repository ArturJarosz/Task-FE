import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {RouterLink} from "@angular/router";

export interface PageCrumb {
    label: string;
    route?: (string | number)[];
}

// Page title on the left, breadcrumb and any projected page actions on the right (DESIGN_GUIDELINES.md, "Every page").
// Routes that render it set data: {ownPageHeader: true} so the app shell hides its own breadcrumb bar.
@Component({
    selector: 'app-page-header',
    templateUrl: 'page-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink]
})
export class PageHeaderComponent {
    @Input()
    title!: string;
    @Input()
    crumbs: PageCrumb[] = [];
}
