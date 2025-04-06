import {Component} from "../base/Component";
import {cloneTemplate, createElement, ensureElement, formatNumber} from "../../utils/utils";
import {EventEmitter} from "../base/EventEmitter";

interface IBasketView {
    items: HTMLElement[];
    price: number;
    selected: string[];
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._price = ensureElement<HTMLElement>('.basket__price', this.container);
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
    }

    toggleButton(state: boolean) {
		this.setDisabled(this._button, !state);
	}

    set items(productList: HTMLElement[]) {
        if (productList.length) {
            this._list.replaceChildren(...productList);
            this.setDisabled(this._button, false);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'                
                }),                
            );            
            this.setDisabled(this._button, true); 
        }
    }

    set price(price: number) {
		this.setText(this._price, `${price} синапсов`);
	}
}