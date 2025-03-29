# Размещение в сети
https://github.com/Siblns/web-larek-frontend

# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Описание кода
Парадигма: MVP
Слой Модель: AppData
Слой Представления: 
  - Card - отображение карточки, 
  - Order - условия доставки, способ оплаты, список товаров в корзине
  - Contact - контакты клиента 
  - Page - основная страница
Слой Презентера будет реализован в основном файле проекта index.ts
1. Класс ProductItem объект, в нашем случае товар
состоит из:
  - id: string;           //ИД для использования в качестве просмотра продукта отдельно, удаления из     корзины, оформления заказа
  - title: string;        //Наименование продукта
  - description: string;  //Описание продукта
  - category: string;     //Категория продукта
  - image: string;        //Изображение продукта
  - price: number;        //Цена продукта

Типы FormInfoErrors и FormContactErrors отвечают за валидацию заполения контактов и доп.информации.

2. Класс Page отображает основые части проетка
состоит из: 
  - Лейбла Корзина и подсчета товаров в ней методом counter
  - Каталога товаров используя сеттер catalog, 
  - возмоности залокировать контент с помощью сеттера locked

3. Класс Contact включает в себя контакты покупателя 
  email: string; //почта покупателя
  phone: string; //телефон
Методы set phone и set email для получения данных

4. Класс Order содержит дополнительную информацию о заказе
  address: string;        //почта покупателя
  paymentMethod: string; //способ оплаты
  items: string[] //массив выбранных продуктов
Методы set address и set paymentMethod для получения данных  

6. Класс Card отвечает за отрисовку данных карточки товара.
Устанавливает соответствие значений полей IProduct и верстки.
Методы get:
  - id()      //для работы с оной карточкой
  - price()   //для подсчета цены выбранных товаров
  - category
__button вся карточка является кнопкой при нажатии на которую открывается подробная информация и возможность покупки товара
Методы set для получения значений из источника, состоят из полных значений Товара:
 - id
 - title
 - price
 - category
 - image
 - description

7. Класс Success
Отвечает за успешное выполнение заказа и дает возможность при клике на кнопку "За новыми покупками" вернуться в основное меню.

8. Класс ProductAPI - отвечает за работу с API
методы: 
 - getProductItem // Получение Товара
 - getProductList // Получение Списка Товаров
 - orderProducts // Получение Товаров находящихся в корзине

9. Класс EventEmitter
местоположение \src\components\base\events.ts
Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков
о наступлении события.
Класс имеет методы on ,  off ,  emit  — для подписки на событие, отписки от события и уведомления
подписчиков о наступлении события соответственно.
Дополнительно реализованы методы  onAll и  offAll  — для подписки на все события и сброса всех
подписчиков.

## Действия пользователя и для него. Методы для реализации
- getProductList - Получение товаров с сервера 
- setCatalog - Отображение товаров и добавление событий
- setPreview - Выбор товара кликом по нему
- toggleOrdered - Добавить товар в корзину
- открыть корзину - Осуществляется событием basket:open из главной страницы
- setOrderField - Открытие формы с вводом контактов после успешного заполнения заказа
- setContactField - Открытие успешной формы в случае успешного заполнения полей и ответа от апи
- removeProduct - Удаление из корзины
- clearBasket очистка корзины
- getTotal - Отображения количество товаров в корзине
- clearBasket - очищение всех корзины после успешного оформления

## Дополнительные проверки форм
- validateOrder - Проверка формы Контактов на заполненность полей
- validateContact - Проверка формы Заказа на заполненность полей 
- Проверка что в корзине что-то лежит для активной кнопки Заказать
