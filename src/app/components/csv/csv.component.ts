import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.sass']
})
export class CsvComponent implements OnInit {
  movimientosData: any[] = [];
  selectedFile: File | undefined;
  cambioData: any[] = [];
  movimiento: any; // Agrega esta línea para declarar la propiedad movimiento
  editingIndex: number | null = null;
  editedDescripcion: string = '';
  editedMonto: number | null = null;


  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.getMovimientos();
    this.getCambioData();
  }

  getMovimientos() {
    const movimientosJSON = localStorage.getItem('movimientos.json');
    if (movimientosJSON) {
      this.movimientosData = JSON.parse(movimientosJSON);
    }
  }

  getCambioData() {
    this.http.get<any[]>('assets/data/cambio.json').subscribe(
      (data) => {
        this.cambioData = data;
        console.log('Datos de cambio cargados:', this.cambioData);
      },
      (error) => {
        console.error('Error al cargar los datos de cambio:', error);
      }
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      console.error('Archivo no válido. Por favor, selecciona un archivo CSV.');
      this.selectedFile = undefined;
    }
  }

  onSubmit() {
    if (this.selectedFile) {
      this.movimientosData = [];

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const csvData = fileReader.result as string;
        const csvRows = csvData.split('\n');
        const headers = csvRows[0].split(',');

        for (let i = 1; i < csvRows.length; i++) {
          const rowData = csvRows[i].split(',');

          const movimiento: any = {};
          for (let j = 0; j < headers.length; j++) {
            const key = headers[j].trim();
            const value = rowData[j].trim().replace(/\r$/, '');
            movimiento[key] = value;
          }

          // Convertir monto a dos decimales
          movimiento.monto = parseFloat(movimiento.monto).toFixed(2);

          // Transformación para movimientos en soles
          if (movimiento.moneda === 'USD') {
            const fechaMovimiento = movimiento.fecha;
            const cambio = this.cambioData.find((c) => c.fecha === fechaMovimiento);

            if (cambio) {
              const valorCambio = parseFloat(movimiento.monto) * cambio.venta;

              movimiento.cambio = cambio;
              movimiento.moneda_cambio = 'PEN';
              movimiento.valor_cambio = valorCambio.toFixed(2);
            }
          }

          this.movimientosData.push(movimiento);
        }


        const jsonData = JSON.stringify(this.movimientosData);
        localStorage.setItem('movimientos.json', jsonData);
        console.log('Archivo JSON guardado en el almacenamiento local.');

        // Reiniciar el formulario
        this.selectedFile = undefined;
      };

      fileReader.readAsText(this.selectedFile);
    } else {
      console.error('Por favor, selecciona un archivo CSV.');
    }
  }

  onReset() {
    localStorage.removeItem('movimientos.json');
    console.log('Archivo JSON eliminado del almacenamiento local.');
    window.location.reload();
  }

  showAlert(movimiento: any) {
    if (movimiento.moneda === 'USD') {
      const alertMessage = `USD to PEN\nMonto USD: ${movimiento.monto}\nValor cambio: ${movimiento.cambio.venta}`;
      alert(alertMessage);
    }
  }

  deleteMovimiento(movimiento: any) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este movimiento?');
    if (confirmacion) {
      const index = this.movimientosData.indexOf(movimiento);
      if (index !== -1) {
        this.movimientosData.splice(index, 1);
      }
    }
  }

  startEditing(index: number) {
    const movimiento = this.movimientosData[index];
    this.editingIndex = index;
    this.editedDescripcion = movimiento.descripcion;
    this.editedMonto = movimiento.moneda !== 'USD' ? parseFloat(movimiento.monto) : parseFloat(movimiento.valor_cambio);
    console.log(this.editedDescripcion, this.editedMonto);

  }


  saveChanges() {
    if (this.editingIndex !== null) {
      const movimiento = this.movimientosData[this.editingIndex];
      movimiento.descripcion = this.editedDescripcion;

      if (this.editedMonto !== null) {
        if (movimiento.moneda === 'USD') {
          movimiento.valor_cambio = this.editedMonto;
          movimiento.monto = (this.editedMonto / movimiento.cambio.venta).toFixed(2).toString();
        } else {
          movimiento.monto = this.editedMonto.toFixed(2).toString();
        }
      }

      if (confirm('¿Deseas guardar los cambios?')) {
        this.cancelEditing();
      }
    }
  }


  cancelEditing() {
    this.editingIndex = null;
    this.editedDescripcion = '';
    this.editedMonto = null;
  }
}
