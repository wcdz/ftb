export interface Movimiento {
    codigo_unico?: string;
    descripcion?: string;
    monto?: string;
    moneda?: string;
    fecha?: string;
    cambio?: {
        compra?: string;
        fecha?: string;
        venta?: string;
    };
    moneda_cambio?: string;
    valor_cambio?: string;
    [key: string]: any;
}
