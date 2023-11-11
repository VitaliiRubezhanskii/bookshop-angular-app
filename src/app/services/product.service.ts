import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.luv2shopApiUrl + '/products';

  private categoryUrl = environment.luv2shopApiUrl + '/product-category';

  private response: GetResponseProducts = new GetResponseProducts() ;

  constructor() { }

  getProduct(theProductId: string): Observable<Product> {

    // need to build URL based on product id
    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.getProducts().pipe(map(products => products.filter(product => product.id == theProductId)[0]))
    // return this.httpClient.get<Product>(productUrl);
  }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> {

    // need to build URL based on category id, page and size 
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}` + `&page=${thePage}&size=${thePageSize}`;

    // console.log(`Getting products from - ${searchUrl}`);
    console.log('thePage = ' + thePage + ' thePageSize ' + thePageSize )
    
    // temporarily mocked with mock object
    // return this.httpClient.get<GetResponseProducts>(searchUrl);
    return this.getProducts().pipe(
      map(products => products
      .filter(product => product.categoryId === theCategoryId)
      .slice((thePage - 1) * thePageSize, thePage * thePageSize))
      )
      .pipe(map(products => {
        this.response.products = products;
        // this.response.page.number = thePage;
        // this.response.page.size = products.length;
        // this.response.page.totalElements = products.length;
        // this.response.page.totalPages = 10;
        return this.response;
       }
      ));
  
    
  }

  // getProductsFromApi(searchUrl: string): Observable<GetResponseProducts> {
  //   return this.httpClient.get<GetResponseProducts>(searchUrl);
  // }

  getProductList(theCategoryId: number): Observable<Product[]> {

    // need to build URL based on category id 
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts();
  }

  searchProducts(theKeyword: string): Observable<Product[]> {

    // need to build URL based on the keyword 
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts().pipe(map(products => products.filter(product => product.name.includes(theKeyword)[0])));
  }

  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProducts> {

    // need to build URL based on keyword, page and size 
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                    + `&page=${thePage}&size=${thePageSize}`;
    
    // return this.httpClient.get<GetResponseProducts>(searchUrl);
    return this.getProducts().pipe(
      map(products => products
      .filter(product => product.name == theKeyword)
      .slice(thePage - 1, thePage * thePageSize))
      )
      .pipe(map(products => {
        this.response.products = products;
        this.response.page.size = products.length;
        return this.response;
      }))
  }

  private getProducts(): Observable<Product[]> {
    let products: Array<Product> = [{
      id: '1', sku: 'BOOK-TECH-1008', name: 'Introduction to Spring Boot',
      description: 'Learn Spring',
      imageUrl:'assets/images/products/books/book-luv2code-1008.png', active: true, 
      unitsInStock: 100, unitPrice: 29.99, 
      categoryId: 1,
      dateCreated: new Date(),
      lastUpdate: new Date()
    },
    {
      id: '2', sku: 'BOOK-TECH-1000', name: 'Crash Course in Python',
      description: 'Learn Python',
      imageUrl:'assets/images/products/books/book-luv2code-1000.png', active: true, 
      unitsInStock: 100, unitPrice: 19.99,
      categoryId: 1,
      dateCreated: new Date(),
      lastUpdate: new Date()
    } as Product,
    {
      id: '3', sku: 'BOOK-TECH-1002', name: 'Exploring Vue.js',
      description: 'Learn Vue.js',
      imageUrl:'assets/images/products/books/book-luv2code-1002.png', active: true, 
      unitsInStock: 100, unitPrice: 24.99,
      categoryId: 1,
      dateCreated: new Date(),
      lastUpdate: new Date()
    } as Product,
    {
      id: '4', sku: 'BOOK-TECH-1003', name: 'Advanced Technics in Big Data',
      description: 'Learn Big Data',
      imageUrl:'assets/images/products/books/book-luv2code-1003.png', active: true, 
      unitsInStock: 100, unitPrice: 29.99,
      categoryId: 1,
      dateCreated: new Date(),
      lastUpdate: new Date()
    } as Product,
    {
      id: '5', sku: 'BOOK-TECH-1010', name: 'Beginners Guide to Data Science',
      description: 'Learn Data Science',
      imageUrl:'assets/images/products/books/book-luv2code-1010.png', active: true, 
      unitsInStock: 100, unitPrice: 24.99,
      categoryId: 1,
      dateCreated: new Date(),
      lastUpdate: new Date()
    } as Product];
    return of(products);
    // return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(map(response => response._embedded.products));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    let categories: Array<ProductCategory> = [{id: 1, categoryName: 'BOOKS'}]
    return of(categories);
    // return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe( 
    //   map(response => response._embedded.productCategory)
    //   );
  }
}

class GetResponseProducts {
  
  products: Product[];
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}