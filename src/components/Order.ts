import {Form} from "./common/Form";
import {IOrder} from "../types";
import {IEvents} from "./base/EventEmitter";
import {ensureAllElements} from "../utils/utils";

export class Order extends Form<IOrder> {  
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
   
    set paymentMethod( value: string) {
        this._buttonsAlt.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === value);
        });
    }
    
    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}
