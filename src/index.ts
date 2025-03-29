import './scss/styles.scss';
import {ProductAPI} from "./components/ProductAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/EventEmitter";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import {Modal} from "./components/common/Modal";
import {CatalogItem} from "./components/Card";
import {Order} from "./components/Order";
import {Contact} from "./components/Contact";
import {Basket} from "./components/common/Basket";
import {IOrderForm, IContact} from "./types";
import {Success} from "./components/common/Success";

const events =  new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Модель данных приложения
const appData = new AppState({}, events);

console.log( page);
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

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
      const card = new CatalogItem('card'
        ,cloneTemplate(cardCatalogTemplate)
        , {
          onClick: () => events.emit('items:changed', item)
      });
      return card.render({
          title: item.title,
          image: item.image,
          price: item.price
      });      
  });
  
  page.counter = appData.getProduct().length;
});

// Изменен открытый выбранный продукт
events.on('items:changed', (item: ProductItem) => {
  const showItem = (item: ProductItem) => {
   const card = new CatalogItem('card'
     ,cloneTemplate(cardPreviewTemplate), {
     onClick: () => events.emit('basket:changed', item)
  });      

   modal.render({
       content: card.render({
         title: item.title,
         image: item.image,
         price: item.price             
       })

   });
 };

  if (item) {
   api.getProductItem(item.id)
       .then((result) => {
           item.description = result.description;
           showItem(item);
       })
       .catch((err) => {
           console.error(err);
       })
  } else {
    modal.close();
  }
});

// Изменения в лоте, но лучше все пересчитать
events.on('basket:changed', (item: ProductItem) => {   

  modal.render({content: createElement<HTMLElement>('div', {}, [
    basket.render()
    ]
  )
  });
  console.log(item)
  let total = 0;
  basket.selected = appData.order.items;
  basket.total = total;
  console.log(basket.selected)
  console.log(basket.total)
  
})

// Открыть корзину
events.on('basket:open', () => {
  modal.render({
      content: createElement<HTMLElement>('div', {}, [
        basket.render()
        
      ]
      )
  });
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

events.on('contact:open', () => {
  modal.render({
   content: contact.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
});
});

// Изменилось одно из полей
events.on('order-button_alt:activ', (data: {field: keyof Partial<IOrderForm>,  value: string }) => {
  order.paymentMethod = data.value;
  appData.setOrderField('payment', data.value);
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

events.on(/^contact\..*:change/, (data: { field: keyof IContact, value: string }) => {
  contact.email = data.value;
  contact.phone = data.value;
  console.log('reter')
  console.log(data.field, data.value)
  appData.setContactField(data.field, data.value);
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { payment, address } = errors;
  order.valid = !payment && !address;
  order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации формы
events.on('formContactErrors:change', (errors: Partial<IContact>) => {
  const { email, phone } = errors;
  order.valid = !email && !phone;
  order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Отправлена форма заказа
events.on('contact:submit', () => {
 // contacts.email = data.value;
  //contacts.phone = data.value;

  api.orderProducts(appData.order)
      .then((result) => {
          const success = new Success(cloneTemplate(successTemplate), {
              onClick: () => {
                  modal.close();
                  appData.clearBasket();
                  events.emit('items:changed');
              }
          });

          modal.render({
              content: success.render({})
          });
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
