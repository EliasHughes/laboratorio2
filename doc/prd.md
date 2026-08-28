# PRD — Yazoo Lab Inventory / Control de Calidad

## 1. Producto
Sistema interno de Rones y Bebidas del Caribe Yazoo para inventario de laboratorio, almacén, calidad y registros oficiales (formatos Y-FO-*).

Stack: React + TypeScript + Vite (puerto 3005) · FastAPI + Uvicorn (8010) · SQL Server.

## 2. Usuarios
- Admin (Elias Hughes / rol ADMIN): usuarios, roles, todo el sistema.
- Calidad / Laboratorio: formularios, lotes, cuarentena.
- Almacén / WMS: recepciones, transferencias, despachos.
- Compras: proveedores y OC.
- Dirección: dashboard, reportes, auditoría.

## 3. Alcance actual (lo que debe funcionar)
- Auth (login usuario o correo), sesión JWT.
- Usuarios y roles (vistas granulares: pendiente de ocultar menú).
- Inventario / lotes, almacén central → laboratorio (solo stock transferido).
- Recepción / ingresos, compras (OC + recibir).
- WMS piso, retiros/despachos.
- 14 formularios oficiales (alta, edición, impresión, listado).
- Reportes: lotes, recepciones, OC, calidad, auditoría + buscador + imprimir listado/ficha.
- Alertas de vencimiento (campana + toast).
- Auditoría de acciones.
- PWA (instalable; build pendiente de cierre).

## 4. Reglas de negocio
- Todo producto nuevo entra a almacén central.
- Laboratorio solo usa cantidad transferida.
- Formulario NUEVO inicia vacío; EDITAR carga el JSON de `form_records`.
- Fecha de emisión de formularios no editable tras crear (salvo admin, donde aplique).
- Impresión con membrete Yazoo; ficha debe respetar el formato del papel.
- Guardado en SQL Server (`form_records.data_json`). No depender de localStorage.

## 5. Fuera de alcance (fases siguientes)
- Contabilidad / ERP completo (tipo Odoo/D365).
- Página 2 de Inspección de instalaciones.
- Impresión ficha 100 % idéntica al papel desde Reportes (hoy membrete + JSON).
- Homologación visual total + PWA en producción.
- Roles aplicados a cada ruta del menú.

## 6. Criterios de aceptación
- GET/POST/PUT `/api/v1/forms` → 200.
- Lista de formularios muestra creado/modificado por.
- Alta nueva no arrastra datos de otra ficha.
- Transferencia no deja usar más stock del movido.
- Alertas de lote por vencer visibles.