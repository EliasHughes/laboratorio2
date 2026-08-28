export type FieldDef = {
  key: string
  label: string
  type: 'text' | 'date' | 'textarea' | 'select' | 'number'
  options?: string[]
  required?: boolean
}

export type CatalogItem = {
  type: string
  code: string
  title: string
  fields: FieldDef[]
  /** si true, el formulario maneja tabla de resultados dinámicos */
  hasResultRows?: boolean
}

export const FORM_CATALOG: CatalogItem[] = [
  {
  type: 'certificado_analisis',
  code: 'Y-FO-CC-013',
  title: 'Certificado de Análisis / Certificate of Analysis',
  hasResultRows: true,
  fields: [
    { key: 'fecha_emision_doc', label: 'Fecha de Emisión del documento', type: 'date', required: true },
    { key: 'numero_certificado', label: 'Número de Certificado', type: 'text', required: true },
    { key: 'nombre_cliente', label: 'Nombre del cliente / Customer name', type: 'text', required: true },
    { key: 'destino_envio', label: 'Destino de envío / Shipping destination', type: 'text' },
    { key: 'identificacion_muestra', label: 'Identificación de la(s) muestra(s) / Sample(s) identification', type: 'text', required: true },
    { key: 'tipo_muestra', label: 'Tipo de muestra / Type of sample', type: 'text' },
    { key: 'condiciones_iniciales', label: 'Condiciones iniciales de la(s) muestra(s)', type: 'text' },
    { key: 'caracteristicas_organolepticas', label: 'Características organolépticas de la(s) muestra(s)', type: 'textarea' },
    { key: 'fecha_recepcion', label: 'Fecha de recepción de la(s) muestra(s) / Reception date', type: 'date' },
    { key: 'fecha_analisis', label: 'Fecha de ejecución del análisis / Date of analysis', type: 'date', required: true },
    { key: 'desviaciones_metodos', label: 'Desviaciones adicionales o exclusiones de métodos', type: 'text' },
    { key: 'observaciones', label: 'Observaciones / Observation(s)', type: 'textarea' },
    { key: 'muestra_numero', label: 'Muestra número / Sample number', type: 'text' },
    { key: 'fecha_produccion', label: 'Fecha de producción / Production date', type: 'date' },
    { key: 'fecha_vencimiento', label: 'Fecha de vencimiento / Expiry date', type: 'date' },
  ],
},  {
    type: 'inspeccion_recepcion_insumos',
    code: 'Y-FO-CS-001',
    title: 'Registro de Inspección — Recepción de Insumos',
    hasResultRows: false,
    fields: [
      // DESCRIPCIÓN
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'hora', label: 'Hora', type: 'text' },
      { key: 'proveedor', label: 'Proveedor', type: 'text', required: true },
      { key: 'cliente', label: 'Cliente', type: 'text' },
      { key: 'placa_no', label: 'Placa No.', type: 'text' },
      { key: 'inspector', label: 'Inspector de Calidad', type: 'text', required: true },
      { key: 'orden_contenedor', label: 'No. Orden / Contenedor', type: 'text' },
      { key: 'responsable_recepcion', label: 'Responsable Recepción', type: 'text' },

      // I. IDENTIFICACIÓN DEL INSUMO
      { key: 'tipo_insumo', label: 'Tipo de Insumo', type: 'select', options: [
        'Botella vidrio', 'Botella plástico', 'Etiqueta frontal', 'Separadores de botellas',
        'Etiqueta dorsal', 'Caja Corrugada', 'Termoencogible', 'Otros'
      ]},
      { key: 'nombre_insumo', label: 'Nombre del insumo', type: 'text', required: true },
      { key: 'mercado_destino', label: 'Mercado Destino', type: 'select', options: ['RD', 'USA', 'EUROPA', 'Otro'] },
      { key: 'lote_proveedor', label: 'Lote Proveedor', type: 'text' },
      { key: 'cantidad_recibida', label: 'Cantidad recibida', type: 'text' },
      { key: 'unidad', label: 'Unidad', type: 'text' },
      { key: 'condicion_transporte', label: 'Condición del Transporte', type: 'select', options: ['Conforme', 'No Conforme'] },
      { key: 'obs_identificacion', label: 'Observaciones (Identificación)', type: 'textarea' },

      // II. MUESTREO
      { key: 'tamano_lote', label: 'Tamaño del Lote', type: 'text' },
      { key: 'nivel_inspeccion', label: 'Nivel de Inspección (AQL)', type: 'text' },
      { key: 'tamano_muestra', label: 'Tamaño de Muestra', type: 'text' },
      { key: 'tipo_inspeccion', label: 'Tipo de Inspección', type: 'select', options: ['Visual', 'Físico', 'Documental'] },
      { key: 'obs_muestreo', label: 'Observaciones (Muestreo)', type: 'textarea' },

      // III. CRITERIOS — Botellas/Tapa/Corcho
      { key: 'c_integridad_fisica', label: 'Integridad Física', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_limpieza', label: 'Limpieza', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_dimension_acabado', label: 'Dimensión / Acabado', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_compatibilidad', label: 'Compatibilidad', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_contenido_neto', label: 'Contenido neto', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_apariencia_superficie', label: 'Apariencia superficie', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_diseno_color', label: 'Diseño y color', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_fuga', label: 'Fuga', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_porosidad', label: 'Porosidad', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_ajuste', label: 'Ajuste', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_olor', label: 'Olor', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },

      // III. Etiquetas / cajas
      { key: 'c_diseno_correcto', label: 'Diseño Correcto', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_idioma_mercado', label: 'Idioma / Mercado', type: 'select', options: ['Conforme', 'No Conforme', 'N/A'] },
      { key: 'c_grado_alcoholico', label: 'Grado Alcohólico', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_informacion_legal', label: 'Información Legal', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_trazabilidad', label: 'Trazabilidad', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_dimensiones', label: 'Dimensiones', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_codigo_producto', label: 'Código del producto', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_codigo_yazoo', label: 'Código de Yazoo', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_armado', label: 'Armado', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_resistencia', label: 'Resistencia', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_funcionalidad', label: 'Funcionalidad', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'c_alergenos', label: 'Declaración de alérgenos conforme', type: 'select', options: ['Conforme', 'No Conforme', 'No Aplica'] },
      { key: 'obs_criterios', label: 'Observaciones (Criterios de inspección)', type: 'textarea' },

      // IV. RESULTADO
      { key: 'decision', label: 'Decisión', type: 'select', options: [
        'APROBADO / LIBERADO',
        'RECHAZADO / RETENIDO',
        'APROBADO CON OBSERVACIÓN'
      ], required: true },
      { key: 'comentarios', label: 'Comentarios', type: 'textarea' },

      // V. ACCIÓN NC
      { key: 'accion_nc', label: 'Acción en caso de No Conformidad', type: 'select', options: [
        'N/A',
        'Retención Lote',
        'Devolución a Proveedor',
        'Uso Condicionado',
        'Registro de NC'
      ]},

      // VI. FIRMAS (texto por ahora; firmas auto más adelante)
      { key: 'firma_inspector', label: 'Inspector de Calidad', type: 'text' },
      { key: 'firma_almacen', label: 'Responsable de Almacén', type: 'text' },
    ],
  }, // Los demás se irán agregando uno por uno después del CoA
]