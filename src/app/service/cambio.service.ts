import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CambioService {

  private cambioData: any[] = [];

  constructor(private http: HttpClient) { }

  getCambioData(): Observable<any> {
    return this.http.get<any>('assets/data/cambio.json').pipe(
      tap((data: any) => {
        this.cambioData = data;
        console.log('Datos de cambio cargados:', this.cambioData);
      }),
      catchError((error: any) => {
        console.error('Error al cargar los datos de cambio:', error);
        throw error;
      })
    );
  }
}
