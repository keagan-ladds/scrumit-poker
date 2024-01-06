import { NgModule } from "@angular/core";
import { NavbarComponent } from "./navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { FooterComponent } from "./footer/footer.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [NavbarComponent, FooterComponent],
    imports: [CommonModule, RouterModule, NgbCollapseModule],
    exports: [NavbarComponent, FooterComponent]
})
export class SharedModule {

}