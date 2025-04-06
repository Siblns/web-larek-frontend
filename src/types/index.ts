//товары
export interface IProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
}
//состояние приложения
export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  order: IOrderFull | null;
}
//заполнение контактных данных для заказа
export interface IContact {
  email: string;
  phone: string;
}
//заполнение уточняющих данных для заказа
export interface IOrderForm {
  address: string;
  payment: string;
}
// состав корзины
export interface IOrderFull extends IContact, IOrderForm {
  total: number;
  items: string[]
}
//тип заполнение данных для заказа
export type TOrderInput = Pick<
	IOrderFull,
	'payment' | 'address' | 'email' | 'phone'
>;
//тип состав корзины
export type TContactBasket = Pick<
	IOrderFull,
	'items' | 'total'
>;

//результат
export interface IOrderResult {
  id: string;
  total: number;
}

export type FormErrors = Partial<Record<keyof IOrderFull, string>>;
