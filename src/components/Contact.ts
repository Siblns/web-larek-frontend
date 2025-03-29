import {Form} from "./common/Form";
import {IContact} from "../types";
import {IEvents} from "./base/EventEmitter";

export class Contact extends Form<IContact> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }
    
    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}