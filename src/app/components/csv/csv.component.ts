import { Component, OnInit } from '@angular/core';
import { MovimientosService } from './../../service/movimientos.service';
import { Movimiento } from './../../interfaces/movimiento.interface';
import { CambioService } from 'src/app/service/cambio.service';

@Component({
  selector: 'app-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.sass']
})
export class CsvComponent implements OnInit {
  movimientosData: Movimiento[] = [];
  selectedFile: File | undefined;
  cambioData: any[] = [];
  movimiento: any;
  editingIndex: number | null = null;
  editedDescripcion: string = '';
  editedMonto: number | null = null;

  constructor(
    private movimientosService: MovimientosService,
    private cambiosService: CambioService
  ) { }

  ngOnInit(): void {
    this.getMovimientos();
    this.getCambioData();
  }

  getMovimientos() {
    this.movimientosService.getMovimientos().subscribe(
      (movimientos: Movimiento[]) => {
        this.movimientosData = movimientos;
      },
      (error: any) => {
        console.error('Error al obtener los movimientos:', error);
      }
    );
  }

  getCambioData() {
    this.cambiosService.getCambioData().subscribe(
      (data: any) => {
        this.cambioData = data;
      },
      (error: any) => {
        console.error('Error al obtener los datos de cambio:', error);
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
        this.movimientosService.parseCsvData(csvData, this.cambioData)
          .subscribe(
            (movimientos) => {
              this.movimientosData = movimientos;
              this.movimientosService.saveMovimientos(movimientos);
              console.log('Archivo JSON guardado en el almacenamiento local.');
            },
            (error) => {
              console.error('Error al procesar el archivo CSV:', error);
            }
          );
      };

      fileReader.readAsText(this.selectedFile);
    } else {
      console.error('Por favor, selecciona un archivo CSV.');
    }
  }

  onReset() {
    this.movimientosService.clearMovimientos();
    console.log('Archivo JSON eliminado del almacenamiento local.');
    window.location.reload();
  }

  showAlert(movimiento: Movimiento) {
    if (movimiento.moneda === 'USD') {
      const alertMessage = `USD to PEN\nMonto USD: ${movimiento.monto}\nValor cambio: ${movimiento.cambio ? movimiento.cambio.venta : ''}`;
      alert(alertMessage);
    }
  }

  deleteMovimiento(movimiento: Movimiento) {
    console.log(movimiento);
    const movimientos = this.movimientosData;
    const codigo_unico = movimiento.codigo_unico;
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este movimiento?');
    if (confirmacion) {
      this.movimientosService.deleteMovimiento(movimientos, codigo_unico);
    }
  }

  startEditing(index: number) {
    const movimiento = this.movimientosData[index];
    const { descripcion, moneda, monto, cambio } = movimiento;

    this.editingIndex = index;
    this.editedDescripcion = descripcion ?? '';
    this.editedMonto = moneda !== 'USD' ? parseFloat(monto ?? '') : parseFloat(cambio?.venta ?? '');
  }

  saveChanges() {
    if (!this.editedDescripcion || !this.editedMonto) {
      alert('Los campos son requeridos');
      return;
    }

    if (this.editingIndex !== null) {
      const movimientos = this.movimientosData;
      const editData = { index: this.editingIndex, editedDescripcion: this.editedDescripcion, editedMonto: this.editedMonto };

      this.movimientosService.editMovimiento(movimientos, editData);
    }


    if (confirm('¿Deseas guardar los cambios?')) {
      this.cancelEditing();
    }
  }


  cancelEditing() {
    this.editingIndex = null;
    this.editedDescripcion = '';
    this.editedMonto = null;
  }
}
