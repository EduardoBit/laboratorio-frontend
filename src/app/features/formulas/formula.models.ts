export interface ComponenteFormula {
  id: number;
  insumoId: number;
  insumoNombre: string;
  cantidad: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

export interface FormulaMaestraCreateRequest {
  nombre: string;
  cantidadBase: number;
  unidadMedidaId: number;
  componentes: ComponenteFormulaRequest[];
}

export interface ComponenteFormulaRequest {
  insumoId: number;
  cantidad: number;
  unidadMedidaId: number;
}

export interface FormulaMaestra {
  id: number;
  nombre: string;
  estado: 'ACTIVA' | 'INACTIVA';
  versiones: FormulaVersion[];
}

export interface FormulaVersion {
  id: number;
  formulaMaestraId: number;
  numeroVersion: number;
  cantidadBase: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
  usadaEnPreparacion: boolean;
  componentes: ComponenteFormula[] | null;
}

export interface FormulaMaestraPage {
  content: FormulaMaestra[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface FormulaTecnicaComponenteResponse {
  insumoId: number;
  insumoNombre: string;
  cantidadTeorica: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

export interface FormulaTecnicaResponse {
  id: number;
  detalleRecetaId: number;
  formulaVersionId: number;
  formulaNombre: string;
  numeroVersion: number;
  tipo: 'DIRECTA' | 'ADAPTADA';
  justificacion?: string | null;
  responsableId: number;
  fecha: string;
  componentes: FormulaTecnicaComponenteResponse[];
}

export interface FormulaTecnicaComponenteRequest {
  insumoId: number;
  cantidadTeorica: number;
  unidadMedidaId: number;
}

export interface FormulaTecnicaCreateRequest {
  detalleRecetaId: number;
  formulaVersionId: number;
  tipo: 'DIRECTA' | 'ADAPTADA';
  justificacion?: string | null;
  componentes?: FormulaTecnicaComponenteRequest[];
}