export interface BookAuthor {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  publishDate: string;
  gender: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  author: BookAuthor;
}
