import _, { partial } from "lodash";

import {Model} from "./base/Model";
import {
    FormErrors, 
    FormErrorContacts,
    IAppState,
    IContact,
    IOrderForm,
    IOrder,
    IProduct} from "../types";

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
    basket: string[];
    catalog: ProductItem[];
    loading: boolean;
    contact: IContact = {
        email: '',
        phone: ''
    };
    order: IOrder = {
        address: '',
        payment: '',
        items: []
    };    
    preview: string | null;
    formErrors: FormErrors = {};
    formContactErrors: FormErrorContacts = {};

    toggleOrdered(id: string, isIncluded: boolean) {
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }
   
    clearBasket() {
        this.order.items.forEach(id => {
            this.toggleOrdered(id, false);
        });
    }

    removeProduct(id: string): void {
		if (!this.order.items.find(it => it === id)) {
			throw new Error(`Invalid product key: ${id}`);
		}
        else {
            this.toggleOrdered(id, false);
        }
	}

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    getProduct(): ProductItem[] {
        return this.catalog;
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('contact:open', this.order);
        }
    }

    setContactField(field: keyof IContact, value: string) {
        this.contact[field] = value;

        if (this.validateContact()) {
            this.events.emit('order:submit', this.contact);
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
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContact() {
        const errors: typeof this.formContactErrors = {};
        console.log('12123')
        if (!this.contact.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.contact.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formContactErrors = errors;
        this.events.emit('formContactErrors:change', this.formContactErrors);
        return Object.keys(errors).length === 0;
    }
}