import _, { partial } from "lodash";
import {Model} from "./base/Model";
import {
    FormErrors,
    IAppState,
    IProduct,
    TOrderInput,
    TContactBasket
    } from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProduct> {
    id: string;
    description: string;
    category: string;    
    image: string;
    title: string;
    price: number;
}

export class AppState extends Model<IAppState> {
    basket: TContactBasket = {
        items: [],
		total: 0
    }
    catalog: ProductItem[] = [];
    order: TOrderInput = {
        email: '',
        phone: '',
        address: '',
        payment: ''
     };
    formErrors: FormErrors = {};
   
    isInBasket(item: IProduct) {
		return this.basket.items.includes(item.id);
	}
    
    addBasket(item: IProduct) {
        if (!this.basket.items && !this.basket.items.find(id => id === item.id)) {
			throw new Error(`Invalid product key: ${item.id}`);
		}
        else {
            this.basket.items.push(item.id);
            this.basket.total += item.price;
            this.events.emit('basket:change', item);
        }
	}

    removeBasket(item: IProduct) {
        if (!this.basket.items && !this.basket.items.find(id => id === item.id)){
			throw new Error(`Invalid product key: ${item.id}`);
		}
        else {
            this.basket.items = this.basket.items.filter((id) => id !== item.id);
            this.basket.total -= item.price;
            this.events.emit('basket:change', item);
        }
	}

    clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.events.emit('basket:change');
	}

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('catalog:changed', { catalog: this.catalog });
    }

    setOrderField(field: keyof TOrderInput, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('contact:open', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
       
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты';
        }
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }

        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    clearOrder() {
		this.order = {
			email: '',
			phone: '',
			address: '',
			payment: '',
		};
        this.basket = {
			total: 0,
			items: []
		};
	}
}