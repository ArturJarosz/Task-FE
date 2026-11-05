import {ChangeDetectionStrategy, Component, inject, Input, OnChanges} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {RouterLink} from "@angular/router";

// The browser tab reads "<page> · OMCD"; index.html starts with the app name alone
export const APP_TITLE = 'OMCD';

export interface PageCrumb {
    label: string;
    route?: (string | number)[];
}

// Page title on the left, breadcrumb and any projected page actions on the right (DESIGN_GUIDELINES.md, "Every page").
// Routes that render it set data: {ownPageHeader: true} so the app shell hides its own breadcrumb bar.
// It also names the browser tab after the last breadcrumb, so tabs, history and screen readers can tell pages apart.
@Component({
    selector: 'app-page-header',
    templateUrl: 'page-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink]
})
export class PageHeaderComponent implements OnChanges {
    @Input()
    title!: string;
    @Input()
    crumbs: PageCrumb[] = [];

    private readonly documentTitle = inject(Title);

    ngOnChanges(): void {
        let page = this.crumbs.at(-1)?.label || this.title;
        this.documentTitle.setTitle(page ? `${page} · ${APP_TITLE}` : APP_TITLE);
    }
}
