//товары
export interface IProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
}

export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  contact: IContact | null;
  order: IOrder | null;
  loading: boolean;
}

//контакты
export interface IContact {
  email: string;
  phone: string;
}

export interface IOrderForm {
  address: string;
  payment: string;
}

export interface IOrder extends IOrderForm {
  items: string[]
}

//результат
export interface IOrderResult {
  id: string;
}

export type FormErrorContacts = Partial<Record<keyof IContact, string>>;
export type FormErrors = Partial<Record<keyof IOrder, string>>;
