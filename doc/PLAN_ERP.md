# YLMS · Programa de ERP por fases
## Rones y Bebidas del Caribe Yazoo

Principio: **no se abre una fase nueva hasta cerrar la anterior**.
El módulo prioridad (Inventario + Laboratorio + Calidad) es la Fase 0–1.
Las fases 2+ se apoyan en stock real, lotes y formularios oficiales, no en pantallas sueltas.

Stack de plataforma (no se cambia):
React 18 + TypeScript + Vite · FastAPI · SQLAlchemy · SQL Server · impresión de formatos Y-FO-*.

---

## Fase 0 — Estabilizar lo que ya existe  ← EN CURSO
**Objetivo:** la app arranca, se loguea, guarda formularios y mueve stock sin romperse.

- Cliente HTTP (`services/api`) + Vite/Tailwind/TSConfig.
- Páginas que el router ya declara (retiros, almacén, WMS, workspace).
- Un solo registro de routers FastAPI.
- Enums de lote/movimiento alineados con el código (`ingreso`, `retiro_analisis`, `agotado`).
- FEFO sin variables indefinidas.
- `create_tables` importa todos los modelos.
- Códigos Y-FO-* iguales al papel.
- Impresión del listado deja de ser JSON crudo (se usa la plantilla del formulario).

Criterio de salida: `npm run build` OK, login OK, recepción → lote → transferencia a laboratorio → retiro FEFO → formulario Agua/CoA se guarda.

---

## Fase 1 — Inventario + Laboratorio + Calidad (prioridad de entrega)
**Objetivo:** módulo vendible para la planta. Nada de ERP extra.

Inventario
- Existencia por producto + lote + ubicación (Almacén central / Laboratorio / Refrigerado / Cuarentena).
- Movimientos: ingreso, transferencia, retiro análisis, despacho producción, ajuste, cuarentena.
- Kardex imprimible de un lote.
- Alertas: vencido, por vencer 30 días, stock mínimo.
- FEFO obligatorio en retiros de laboratorio.
- Recepción de insumos / granel / pulpa crea lote + movimiento (hoy el form queda huérfano).

Laboratorio / Calidad
- 14 formularios oficiales, alta vacía, edición desde SQL (`form_records`).
- Impresión HTML fiel al papel; PDF servidor (ReportLab) para CoA, Insumos y Agua.
- Estados: borrador → pendiente aprobación → aprobado / rechazado.
- Quien llena ≠ quien aprueba. Admin no auto-firma slots ajenos.
- CoA Y-FO-CC-013 bilingüe + CoA moderno de liberación (pág. 1 del PDF) como documento distinto.
- Muestra / lote / CoA quedan amarrados al inventario.

Criterio de salida: un analista imprime Agua, Insumos y CoA al lado del papel y reconoce la hoja. Un almacenero recibe, transfiere y no deja usar stock que no viajó a laboratorio.

---

## Fase 2 — Compras y proveedores
- Proveedores (RNC, contacto, mercado).
- Órdenes de compra con líneas, moneda DOP/USD, ITBIS 18 %.
- Recibir OC → crea lotes en almacén central (reutiliza Fase 1).
- Estado OC: borrador → emitida → parcial → recibida → cerrada.
- No conformidad de insumos puede devolver o retener el lote.

Criterio de salida: una OC se recibe y el kardex muestra el ingreso con número de OC.

---

## Fase 3 — Producción ligera (ron / destilados)
- Recetas / BOM (versión).
- Órdenes de elaboración y de envasado.
- Consumo de granel + insumos desde lotes (FEFO).
- Formularios Y-FO-CC-009 y Y-FO-CC-034 quedan ligados a la OP.
- Tanques / cisternas como ubicaciones con capacidad.

Criterio de salida: una OP descuenta licor e insumos y deja un lote de producto terminado.

---

## Fase 4 — Ventas y despacho
- Clientes y destinos de envío (ya viven en el CoA).
- Pedidos → picking WMS → despacho.
- CoA se emite al liberar el lote de venta.
- Factura simple + NCF (sin contabilidad completa).

Criterio de salida: un lote aprobado genera CoA + documento de despacho.

---

## Fase 5 — Mantenimiento y metrología
- Equipos e instrumentos.
- Calibraciones y vencimiento de certificados.
- Bloqueo de equipo fuera de calibración en ensayos.

---

## Fase 6 — EHS / SST
- Incidentes, EPP, inspecciones de instalaciones (el form Y-FO-BI-018 ya existe).
- Índices básicos de frecuencia / gravedad.

---

## Fase 7 — Personas (RRHH mínimo)
- Empleados, cargos, organigrama.
- Firmas nominativas ligadas al usuario.
- Vacaciones / permisos. Nómina RD queda **fuera** hasta que Finanzas exista.

---

## Fase 8 — Finanzas
- CxP / CxC sobre OC y facturas de Fase 2 y 4.
- Antigüedad 30/60/90.
- No se construye un contable completo (asientos, NCF DGII avanzado) en esta fase.

---

## Fase 9 — Plataforma
- Permisos aplicados a cada ruta (no solo menú).
- Auditoría consultable con filtros.
- PWA instalable en piso.
- Backup SQL Server + retención de PDF.
- SSO / Microsoft 365 solo si la planta lo exige.

---

## Lo que no entra hasta que Calidad lo pida por escrito
ERP tipo Dynamics (proyectos I+D, flota, nómina TSS, Tesorería, BI).
Cada módulo nuevo debe leer y escribir **lotes**. Si no toca un lote o un formulario Y-FO, no es de este ERP.
