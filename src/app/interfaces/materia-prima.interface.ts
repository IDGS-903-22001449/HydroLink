export interface MateriaPrimaDto {
  id: number;
  nombre: string;
  unidadMedida: string;
}

export interface MateriaPrimaCreateDto {
  nombre: string;
  unidadMedida: string;
}

export interface MateriaPrima {
  id: number;
  name: string;
  unidadMedida: string;
  stock: number;
  costoUnitario: number;
  compras?: any[];
  explosiones?: any[];
}

export interface MateriaPrimaStats {
  totalMateriasPrimas: number;
  unidadesDiferentes: number;
  materiasActivas: number;
  valorTotalInventario: number;
}

export enum UnidadMedida {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  M = 'm',
  CM = 'cm',
  MM = 'mm',
  M2 = 'm2',
  M3 = 'm3',
  UNIDAD = 'unidad',
  PZA = 'pza',
  PAR = 'par',
  DOCENA = 'docena',
  CAJA = 'caja',
  SACO = 'saco',
  ROLLO = 'rollo'
}

export const UNIDADES_MEDIDA_OPTIONS = [
  { value: UnidadMedida.KG, label: 'Kilogramo (kg)' },
  { value: UnidadMedida.G, label: 'Gramo (g)' },
  { value: UnidadMedida.L, label: 'Litro (l)' },
  { value: UnidadMedida.ML, label: 'Mililitro (ml)' },
  { value: UnidadMedida.M, label: 'Metro (m)' },
  { value: UnidadMedida.CM, label: 'Centímetro (cm)' },
  { value: UnidadMedida.MM, label: 'Milímetro (mm)' },
  { value: UnidadMedida.M2, label: 'Metro cuadrado (m²)' },
  { value: UnidadMedida.M3, label: 'Metro cúbico (m³)' },
  { value: UnidadMedida.UNIDAD, label: 'Unidad' },
  { value: UnidadMedida.PZA, label: 'Pieza' },
  { value: UnidadMedida.PAR, label: 'Par' },
  { value: UnidadMedida.DOCENA, label: 'Docena' },
  { value: UnidadMedida.CAJA, label: 'Caja' },
  { value: UnidadMedida.SACO, label: 'Saco' },
  { value: UnidadMedida.ROLLO, label: 'Rollo' }
];
