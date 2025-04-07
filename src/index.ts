import './scss/styles.scss';
import {ProductAPI} from "./components/ProductAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/EventEmitter";
import {cloneTemplate, ensureElement} from "./utils/utils";
import {AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import {Modal} from "./components/common/Modal";
import {Card, cardBasket} from "./components/Card";
import {Order} from "./components/Order";
import {Contact} from "./components/Contact";
import {Basket} from "./components/common/Basket";
import {IOrderFull} from "./types";
import {Success} from "./components/common/Success";

const events =  new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Модель данных приложения
const appData = new AppState({}, events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Все шаблоны
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contact = new Contact(cloneTemplate(contactTemplate), events);


events.on<CatalogChangeEvent>('catalog:changed', () => {
  page.catalog = appData.catalog.map(item => {
      const card = new Card(cloneTemplate(cardCatalogTemplate), {
          onClick: () => events.emit('items:changed', item)
      });
      return card.render({
          id: item.id,
          category: item.category,
          title: item.title,
          image: item.image,
          price: item.price
      });      
  });
});

events.on('items:changed', (item: ProductItem) => {
  const showItem = (item: ProductItem) => {
    const card = new Card (cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        if(appData.isInBasket(item)) {
          appData.removeBasket(item);
          card.buttonText = 'В корзину'
        }
        else {
          appData.addBasket(item);
          card.buttonText = 'Удалить из корзины';
        }               
      }
    });
    
    modal.render({
        content: card.render({
            id: item.id,
            category: item.category,
			description: item.description,
            title: item.title,
            image: item.image,
            price: item.price                 
        })
    });

    if(card.price === 'Бесценно'){
      card.buttonText = 'Не продается';
    }
    else{
      card.buttonText = appData.isInBasket(item) ? 'Удалить из корзины' : 'В корзину';
    }
 };

  if (item) {
   api.getProductItem(item.id)
       .then((result) => {
           showItem(item);
       })
       .catch((err) => {
           console.error(err);
       })
  } else {
    modal.close();
  }
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

events.on('basket:change', () => {
	page.counter = appData.basket.items.length;
	basket.items = appData.basket.items.map((id, index) => {
		const item = appData.catalog.find((item) => item.id === id);
		const card = new cardBasket (cloneTemplate(cardBasketTemplate), {
			onClick: () => appData.removeBasket(item)
		});

    card.index = index + 1;
		return card.render({
      id: item.id,
      title: item.title,
      price: item.price
    });
	});

	basket.price = appData.basket.total;
});

// Открыть форму заказа
events.on('order:open', () => {
  modal.render({
    content: order.render({
       address: '',
       payment: '',
       valid: false,
       errors: []
    })
  });
});

// перейти на форму контактов
events.on('order:submit', () => {
  modal.render({
   content: contact.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
});

// Изменился способ оплаты
events.on('order-button_alt:activ', (
  data: {
      field: keyof Pick<IOrderFull, 'payment'>,
      value: string }) => {
  
  order.payment = data.value;
  appData.setOrderField('payment', data.value);
});

// Изменилось одно из полей в заказе
events.on(/^order\..*:change/, (
    data: { field: keyof Pick<IOrderFull, 'address'>
      , value: string }) => {
      appData.setOrderField(
          data.field
        , data.value);
});

events.on(/^contacts\..*:change/, (
  data: { field: keyof Pick<IOrderFull, 'phone' | 'email'>
    , value: string }) => {
    appData.setOrderField(
        data.field
      , data.value);
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderFull>) => {
  const { payment, address, email, phone } = errors;

  order.valid = !(payment || address);
	order.errors = [payment, address].filter(Boolean).join('; ');

  contact.valid = !(email || phone);
	contact.errors = [email, phone].filter(Boolean).join('; ');
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
  const apiSendOrder = {...appData.order, ...appData.basket}

  api.orderProducts(apiSendOrder)
      .then((result) => {
          const success = new Success(cloneTemplate(successTemplate), {
              onClick: () => {
                  modal.close();
                  events.emit('items:changed');
              }
          });
          success.total = result.total;
          modal.render({
              content: success.render({})
          });
      })
      .then(()=> {
        appData.clearBasket();       
        appData.clearOrder();
      })
      .catch(err => {
          console.error(err);
      });
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем продукты с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
  });
