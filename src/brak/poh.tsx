


import React, { useState } from 'react';

const App = () => {
  // Настройки "конструктора"
  const itemHeight = 50; // Высота одного кубика
  const windowHeight = 200; // Высота нашего окошка
  const totalItems = 100000; // Огромная куча данных
  
  // 1. Следим за тем, где сейчас скролл
  const [scrollTop, setScrollTop] = useState(0);

  // 2. Считаем: какие элементы сейчас в кадре?
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    totalItems - 1, 
    Math.floor((scrollTop + windowHeight) / itemHeight)
  );

  // 3. Создаем массив только из тех, кто "в кадре"
  const itemsToRender = [];
  for (let i = startIndex; i <= endIndex; i++) {
    itemsToRender.push(i);
  }

  return (
    // КУБИК 1: Окошко
    <div 
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: windowHeight, overflowY: 'auto', position: 'relative', border: '2px solid red' }}
    >
      
      {/* КУБИК 2: Длинная невидимая палка (создает скролл) */}
      <div style={{ height: totalItems * itemHeight }} />

      {/* КУБИК 4: Рендерим только нужное */}
      {itemsToRender.map((index) => (
        <div 
          key={index}
          style={{
            position: 'absolute',
            top: index * itemHeight, // Ставим элемент в правильную позицию по вертикали
            height: itemHeight,
            width: '100%',
            borderBottom: '1px solid #ccc'
          }}
        >
          Я — элемент номер {index}
        </div>
      ))}
    </div>
  );
};














// import React, { useMemo } from 'react';

// const PRODUCTS = [
//   { id: "p1", name: "Smartphone", price: 1000 },
//   { id: "p2", name: "Laptop", price: 2000 },
//   { id: "p3", name: "Case", price: 50 },
// ];

// const DISCOUNTS = [
//   { productId: "p1", type: "percent", value: 10 },
//   { productId: "p1", type: "fixed", value: 50 },
//   { productId: "p2", type: "percent", value: 20 },
//   { productId: "p3", type: "fixed", value: 100 },
// ];

// const ProductList = () => {
//   // Создаем новый массив товаров, где у каждого уже посчитана финальная цена
//   const productsWithPrices = useMemo(() => {
//     return PRODUCTS.map((product) => {
      
//       // 1. Ищем скидки для конкретного товара
//       const itemDiscounts = DISCOUNTS.filter(d => d.productId === product.id);

//       // 2. Считаем цену (тот самый редьюс, который ты уже освоил!)
//       const finalPrice = itemDiscounts.reduce((currentPrice, discount) => {
//         let newPrice = currentPrice;
//         if (discount.type === "percent") {
//           newPrice = currentPrice - (currentPrice * (discount.value / 100));
//         } else if (discount.type === "fixed") {
//           newPrice = currentPrice - discount.value;
//         }
//         return Math.max(0, newPrice);
//       }, product.price);

//       // 3. Возвращаем новый объект: старые данные товара + посчитанная цена
//       return {
//         ...product,
//         finalPrice: finalPrice
//       };
//     });
//   }, []);

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Список товаров со скидками</h2>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         {productsWithPrices.map((item) => (
//           <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
//             <strong>{item.name}</strong>
//             <div>Старая цена: <del>{item.price} руб.</del></div>
//             <div style={{ color: 'red', fontWeight: 'bold' }}>
//               Цена со скидкой: {item.finalPrice} руб.
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductList;


// // function calculateTotal(products, discounts) {
// //   return products.reduce((kopilka, tekushiyTovar) => {
    
// //     // Фильтруем
// //     const skidki = discounts.filter(e => e.productId === tekushiyTovar.id);
    
// //     // Сортируем: сначала 'fixed', потом 'percent'
// //     const sortedSkidki = skidki.sort((a, b) => (a.type === 'fixed' ? -1 : 1));

// //     // Считаем цену товара
// //     const finalPrice = sortedSkidki.reduce((cena, skidka) => {
// //       let nextPrice = cena;
// //       if (skidka.type === 'percent') {
// //         nextPrice -= (nextPrice * (skidka.value / 100));
// //       } else {
// //         nextPrice -= skidka.value;
// //       }
// //       return Math.max(0, nextPrice);
// //     }, tekushiyTovar.price);

// //     return kopilka + finalPrice;
// //   }, 0);
// // }