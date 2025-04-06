import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    id: string;
    title: string;
    description: string | string[];
    image: string;
    price: number;
    category: string;
	button: string;
}
export abstract class сardCompact extends Component<ICard> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement) {
		super(container);
        this._title = ensureElement<HTMLElement>(`.card__title`, container);
        this._price = ensureElement<HTMLElement>(`.card__price`, container);
        this._button = container.querySelector(`.card__button`);
	}

	set title(value: string) {
        this.setText(this._title, value);
    }

	get title() {
		return this._title.textContent || '';
	}

    get price(): string {
        return this._price.textContent || '';
    }

    set price(value: string) {
        if(!value){
            this.setText(this._price, 'Бесценно')
            if (this._button) {
                this._button.disabled = true;
            }
        }
        else {
            this.setDisabled(this._button, false);
        }            
    }
}

export class Card extends сardCompact {
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description?: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

        this._image = ensureElement<HTMLImageElement>(`.card__image`, container);
        this._description = container.querySelector(`.card__text`);
        this._category = container.querySelector(`.card__category`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}
    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set category(value: string) {
        this.setText(this._category, value);
    }

    get category(): string {
        return this._category.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }
    
    set buttonText(value: string) {
		this._button.textContent = value;
	}
}

export class cardBasket extends сardCompact {
	protected _index: HTMLElement;
	protected _deleteButton: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
        this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);		
		this._deleteButton = ensureElement<HTMLButtonElement>(`.basket__item-delete`, container);
        
        if (actions?.onClick) {
			if (this._deleteButton) {
				this._deleteButton.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set index(value: number) {
		this.setText(this._index, value);
	}
}
