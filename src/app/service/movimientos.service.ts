import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import * as Papa from 'papaparse';
import { Movimiento } from './../interfaces/movimiento.interface';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private movimientosStorageKey = 'movimientos.json';

  constructor(private http: HttpClient) { }

  getMovimientos(): Observable<Movimiento[]> {
    const movimientosJSON = localStorage.getItem(this.movimientosStorageKey);
    if (movimientosJSON) {
      const movimientos = JSON.parse(movimientosJSON) as Movimiento[];
      return of(movimientos);
    } else {
      return of([]);
    }
  }

  parseCsvData(csvData: string, cambioData: any[]): Observable<Movimiento[]> {
    return new Observable<Movimiento[]>((observer) => {
      Papa.parse(csvData, {
        header: true,
        complete: (result: Papa.ParseResult<{ [key: string]: string }>) => {
          const movimientos: Movimiento[] = [];

          result.data.forEach((rowData: { [key: string]: string }) => {
            const movimiento: Movimiento = {};
            Object.keys(rowData).forEach((key: string) => {
              const value = rowData[key].trim().replace(/\r$/, '');
              movimiento[key] = value;
            });

            movimiento.monto = parseFloat(movimiento.monto || '0').toFixed(2);

            if (movimiento.moneda === 'USD') {
              const fechaMovimiento = movimiento.fecha;
              const cambio = cambioData.find((c) => c.fecha === fechaMovimiento);

              if (cambio) {
                const valorCambio = parseFloat(movimiento.monto) * parseFloat(cambio.venta);

                movimiento.cambio = cambio;
                movimiento.moneda_cambio = 'PEN';
                movimiento.valor_cambio = valorCambio.toFixed(2);
              }
            }

            movimientos.push(movimiento);
          });

          observer.next(movimientos);
          observer.complete();
        }
      });
    });
  }

  saveMovimientos(movimientos: Movimiento[]): void {
    const jsonData = JSON.stringify(movimientos);
    localStorage.setItem(this.movimientosStorageKey, jsonData);
  }

  deleteMovimiento(movimientos: Movimiento[], codigo_unico: any): void {
    if (movimientos) {
      const index = movimientos.findIndex(m => m.codigo_unico === codigo_unico);
      if (index !== -1) movimientos.splice(index, 1);
    }
  }

  clearMovimientos(): void {
    localStorage.removeItem(this.movimientosStorageKey);
  }

  editMovimiento(movimientos: Movimiento[], editData: any) {
    const { index, editedDescripcion, editedMonto } = editData;

    const movimiento = movimientos[index];
    console.log(movimiento);

    movimiento.descripcion = editedDescripcion;

    if (editedMonto !== null) {
      if (movimiento.moneda === 'USD') {
        movimiento.valor_cambio = editedMonto.toFixed(2).toString();
        movimiento.monto = (editedMonto / parseFloat(movimiento.cambio?.venta || '0')).toFixed(2).toString();
      } else {
        movimiento.monto = editedMonto.toFixed(2).toString();
      }
    }

  }
}