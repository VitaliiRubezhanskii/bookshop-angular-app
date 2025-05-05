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

  private productUrl = environment.luv2shopApiUrl + '/products';

  private categoryUrl = environment.luv2shopApiUrl + '/product-category';

  private response: GetResponseProducts = new GetResponseProducts() ;

  constructor(private httpClient: HttpClient) { }

  getProduct(theProductId: string): Observable<Product> {
    const productUrl = `${this.productUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> {

    // need to build URL based on category id, page and size
    const searchUrl = `${this.productUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;

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
        this.response.page.number = thePage;
        this.response.page.size = products.length;
        this.response.page.totalElements = products.length;
        this.response.page.totalPages = 10;
        return this.response;
       }
      ));


  }

  getProductsFromApi(searchUrl: string): Observable<GetResponseProducts> {
    return this.httpClient.get<GetResponseProducts>(this.productUrl);
  }

  getProductList(): Observable<Product[]> {

    // need to build URL based on category id
    // const searchUrl = `${this.productUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts();
  }

  searchProducts(theKeyword: string): Observable<Product[]> {

    // need to build URL based on the keyword
    const searchUrl = `${this.productUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts().pipe(map(products => products.filter(product => product.name.includes(theKeyword)[0])));
  }

  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProducts> {

    // need to build URL based on keyword, page and size
    const searchUrl = `${this.productUrl}/search/findByNameContaining?name=${theKeyword}`
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

  public getProducts(): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(this.productUrl).pipe(map(response => {
        console.log('Call ' + this.productUrl)
        console.log(response.page);
        console.log(response.products);
        console.log(response);
        return response.products;
      }))
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
