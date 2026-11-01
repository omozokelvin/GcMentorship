// Module 5: Essential Array Methods

type Product = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    price: 1000,
    active: true,
  },
  {
    id: 2,
    name: 'Mouse',
    price: 25,
    active: false,
  },
  {
    id: 3,
    name: 'Keyboard',
    price: 75,
    active: true,
  },
];

// .map (data transformation)
const productNames = products.map((product) => product.name);
// console.log(productNames);

// .filter (filtering elements)
const activeProducts = products.filter((item) => item.active);
// console.log(activeProducts);

// .find (Locate a single item)
const productWithId2 = products.find((item) => item.id === 2);
// console.log(productWithId2);

// .reduce (Aggregation)
const totalPrice = products.reduce(
  (accumulator, product) => accumulator + product.price,
  0
);
// console.log(totalPrice);

// 5. Method chaining pipeline

// const totalPriceOfActiveProducts = products
//   .filter((product) => product.active)
//   .map((product) => product.price)
//   .reduce((accumulator, price) => accumulator + price, 0);

// console.log(totalPriceOfActiveProducts);
