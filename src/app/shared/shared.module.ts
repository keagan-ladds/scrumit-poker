import { NgModule } from "@angular/core";
import { NavbarComponent } from "./navbar/navbar.component";
import { RouterModule } from "@angular/router";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { FooterComponent } from "./footer/footer.component";
import { CommonModule } from "@angular/common";
import { JoinRoomComponent } from "./join-room/join-room.component";
import { SpinnerComponent } from "./spinner/spinner.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AlertComponent } from "./alert/alert.component";

@NgModule({
    declarations: [NavbarComponent, FooterComponent, JoinRoomComponent, SpinnerComponent, AlertComponent],
    imports: [CommonModule, RouterModule, NgbCollapseModule, ReactiveFormsModule],
    exports: [NavbarComponent, FooterComponent, JoinRoomComponent, SpinnerComponent, AlertComponent]
})
export class SharedModule {

}