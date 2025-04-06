import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {IEvents} from "./base/EventEmitter";
import {ensureAllElements} from "../utils/utils";

export class Order extends Form<IOrderForm> {  
    protected _buttonsAlt: HTMLButtonElement[];  

     constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events); 
       
        this._buttonsAlt = ensureAllElements<HTMLButtonElement>('.button_alt', container);
       
        this._buttonsAlt.forEach(button => {
            button.addEventListener('click', () => {
                events.emit('order-button_alt:activ', {value: button.name});
            });
        })
    }
   
    set payment( value: string) {
        this._buttonsAlt.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === value);
        });
    }
    
    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}
