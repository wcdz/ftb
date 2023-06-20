import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.sass']
})
export class CsvComponent implements OnInit {

  movimientosData: any[] = [];
  selectedFile: File | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getMovimientos();
  }

  getMovimientos() {
    const movimientosJSON = localStorage.getItem('movimientos');
    if (movimientosJSON) {
      this.movimientosData = JSON.parse(movimientosJSON);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      // Aquí puedes mostrar un mensaje de error o realizar alguna acción en caso de que el archivo no sea un CSV válido.
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
            const value = rowData[j].trim().replace(/\r$/, ''); // Eliminar el carácter \r al final del valor
            movimiento[key] = value;
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

}
