// Generics

type ApiResponse<T> = {
  statusCode: number;
  data: T;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
};

// call api to get users
const getUsers = (): Promise<ApiResponse<User[]>> => {
  return fetch('/api/users').then((res) => res.json());
};

// api to get books
const getBooks = (): Promise<ApiResponse<Book[]>> => {
  return fetch('/api/books').then((res) => res.json());
};
